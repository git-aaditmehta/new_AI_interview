"""
WebSocket router for live interview sessions.
Handles real-time streaming of audio chunks, LLM inference, TTS, and STT.
"""
import asyncio
import json
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.db_models import Interview, Question
from services.interview_service import InterviewSession, process_answer
from services.tts_service import synthesize_b64
from services.stt_service import transcribe

router = APIRouter(tags=["websocket"])

async def safe_synthesize_b64(text: str, voice: str, timeout_s: float = 2.5) -> str:
    """
    Best-effort TTS with a hard timeout.

    Reason: if the TTS provider is slow/unavailable, the WebSocket would otherwise
    block and the frontend stays stuck waiting for GREETING/NEXT_QUESTION.
    """
    try:
        return await asyncio.wait_for(synthesize_b64(text, voice=voice), timeout=timeout_s)
    except Exception as e:
        # Keep interview flow unblocked.
        print(f"[WebSocket] TTS skipped (timeout/failure): {e}")
        return ""


@router.websocket("/ws/interview/{interview_id}")
async def interview_websocket(websocket: WebSocket, interview_id: int, db: AsyncSession = Depends(get_db)):
    await websocket.accept()

    # 1. Fetch interview from database
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview_db = result.scalar_one_or_none()
    
    if not interview_db:
        await websocket.send_json({"type": "ERROR", "message": "Interview not found"})
        await websocket.close()
        return

    # Set status to active if not already
    if interview_db.status == "pending":
        interview_db.status = "active"
        await db.commit()

    # 2. Initialize the Interview Session state machine
    session = InterviewSession(
        interview_id=interview_id,
        resume_id=interview_db.resume_id or "",
        candidate_name=interview_db.candidate_name,
        job_description=interview_db.job_description,
        max_questions=interview_db.max_questions,
        ai_voice=interview_db.ai_voice
    )

    audio_buffer = bytearray()

    try:
        while True:
            # Receive either bytes (audio chunks) or text (JSON commands)
            message = await websocket.receive()

            if "bytes" in message:
                # Accumulate audio data from the microphone
                audio_buffer.extend(message["bytes"])
                
                # We could send TRANSCRIPT_PARTIAL here if we integrated streaming STT,
                # but currently we transcribe after AUDIO_END.
                
            elif "text" in message:
                try:
                    data = json.loads(message["text"])
                except json.JSONDecodeError:
                    continue

                msg_type = data.get("type")

                if msg_type == "START_INTERVIEW":
                    # Send greeting
                    session.state = "GREETING"
                    greeting_text = session.get_greeting()
                    
                    # Update current question tracking
                    session.current_question = greeting_text
                    
                    # Synthesize voice async
                    audio_b64 = await safe_synthesize_b64(greeting_text, voice=session.ai_voice)
                    
                    await websocket.send_json({
                        "type": "GREETING",
                        "text": greeting_text,
                        "audioBase64": audio_b64
                    })
                    
                    session.state = "QUESTIONING"

                elif msg_type == "AUDIO_END":
                    await websocket.send_json({"type": "THINKING", "message": "Processing answer..."})

                    transcript = ""
                    if len(audio_buffer) > 0:
                        try:
                            transcript = await transcribe(bytes(audio_buffer))
                        except Exception as e:
                            print(f"STT Error: {e}")
                            transcript = "" # fallback
                        finally:
                            audio_buffer.clear()

                    # Fallback if transcript fails or empty
                    if not transcript.strip():
                        transcript = data.get("text", "")
                    
                    await websocket.send_json({"type": "TRANSCRIPT_FINAL", "text": transcript})
                    
                    if not transcript.strip():
                        await websocket.send_json({"type": "ERROR", "message": "Could not hear audio. Please try again."})
                        continue

                    # Concurrently generate feedback and next question using LLMs
                    next_q, feedback = await process_answer(session, transcript)

                    await websocket.send_json({
                        "type": "FEEDBACK",
                        "score": feedback.get("score"),
                        "feedback": feedback.get("feedback")
                    })

                    if next_q:
                        # TTS for next question
                        audio_b64 = await safe_synthesize_b64(next_q, voice=session.ai_voice)
                        await websocket.send_json({
                            "type": "NEXT_QUESTION",
                            "text": next_q,
                            "audioBase64": audio_b64
                        })

                    # Check if session finished
                    if session.is_complete():
                        session.state = "COMPLETE"
                        farewell_text = session.get_farewell()
                        audio_b64 = await safe_synthesize_b64(farewell_text, voice=session.ai_voice)
                        
                        await websocket.send_json({
                            "type": "INTERVIEW_COMPLETE",
                            "overall_score": session.compute_overall_score(),
                            "text": farewell_text,
                            "audioBase64": audio_b64
                        })
                        break # exit loop and close connection naturally
                        
                elif msg_type == "PING":
                    await websocket.send_json({"type": "PONG"})
                    
    except WebSocketDisconnect:
        print(f"WebSocket client disconnected for interview {interview_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "ERROR", "message": str(e)})
        except:
            pass
    finally:
        # Upon exit, save conversation history and update final score in DB
        try:
            interview_db.status = "completed" if session.is_complete() else "interrupted"
            interview_db.overall_score = session.compute_overall_score()

            for conv in session.conversations:
                q_record = Question(
                    interview_id=interview_id,
                    question_number=conv["question_number"],
                    question_text=conv["question"],
                    candidate_answer=conv["answer"],
                    score=conv.get("score"),
                    feedback=conv.get("feedback"),
                    criteria_scores=conv.get("criteria_scores"),
                    competency_assessment=conv.get("competency_assessment")
                )
                db.add(q_record)

            await db.commit()
            await websocket.close()
        except Exception as e:
            print(f"Error saving to DB on disconnect: {e}")
