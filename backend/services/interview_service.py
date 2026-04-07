"""
Interview Service — manages the state machine for a live interview session.

States:
  IDLE → GREETING → QUESTIONING → COMPLETE

Responsibilities:
  - Generate greeting message
  - Generate next question (using RAG context + async LLM)
  - Generate feedback for candidate response (concurrent with next question)
  - Track Q&A history within a session
  - Persist results to DB on completion
"""
import asyncio
import random
from typing import Any, Dict, Optional, Tuple

from services.llm_service import get_llm_json
from services.rag_service import retrieve_context
from prompts.templates import (
    NEXT_QUESTION_PROMPT,
    FEEDBACK_PROMPT,
    GREETING_MESSAGES,
    FAREWELL_MESSAGES,
)


class InterviewSession:
    """
    In-memory state for one active interview WebSocket connection.
    One instance per connected WebSocket client.
    """

    def __init__(
        self,
        interview_id: int,
        resume_id: str,
        candidate_name: str,
        job_description: str,
        max_questions: int,
        ai_voice: str,
    ):
        self.interview_id = interview_id
        self.resume_id = resume_id
        self.candidate_name = candidate_name
        self.job_description = job_description
        self.max_questions = max_questions
        self.ai_voice = ai_voice

        self.current_question: str = ""
        self.question_number: int = 0
        self.conversations: list[Dict[str, Any]] = []
        self.state: str = "IDLE"  # IDLE | GREETING | QUESTIONING | COMPLETE

    def get_greeting(self) -> str:
        """Return a randomized greeting message."""
        interviewer_name = _voice_to_name(self.ai_voice)
        template = random.choice(GREETING_MESSAGES)
        return template.format(
            name=self.candidate_name,
            interviewer_name=interviewer_name,
        )

    def get_farewell(self) -> str:
        """Return a randomized farewell message."""
        template = random.choice(FAREWELL_MESSAGES)
        return template.format(name=self.candidate_name)

    def is_complete(self) -> bool:
        return self.question_number >= self.max_questions

    def compute_overall_score(self) -> float:
        if not self.conversations:
            return 0.0
        scores = [c.get("score", 0) for c in self.conversations]
        return round(sum(scores) / len(scores), 2)


async def generate_next_question(session: InterviewSession, previous_answer: str) -> str:
    """
    Use RAG + LLM to generate the next interview question.
    Retrieves relevant resume context based on previous Q&A.
    """
    query = f"{session.current_question} {previous_answer}"
    rag_context = retrieve_context(session.resume_id, query, top_k=5)

    prompt = NEXT_QUESTION_PROMPT.format(
        previous_question=session.current_question,
        candidate_response=previous_answer,
        job_description=session.job_description,
        rag_context=rag_context or "No additional context available.",
    )

    parsed = await get_llm_json(prompt)
    if parsed and "next_question" in parsed:
        return parsed["next_question"]
    return "Can you tell me more about your experience in this area?"


async def generate_feedback(session: InterviewSession, candidate_answer: str) -> Dict[str, Any]:
    """
    Use RAG + LLM to generate structured feedback for the candidate's answer.
    """
    rag_context = retrieve_context(
        session.resume_id,
        f"{session.current_question} {candidate_answer}",
        top_k=3,
    )

    prompt = FEEDBACK_PROMPT.format(
        question=session.current_question,
        candidate_response=candidate_answer,
        job_description=session.job_description,
        rag_context=rag_context or "No additional context available.",
    )

    parsed = await get_llm_json(prompt)
    if parsed:
        return {
            "score": float(parsed.get("score", 5.0)),
            "feedback": parsed.get("feedback", ""),
            "criteria_scores": parsed.get("criteria_scores", {}),
            "competency_assessment": parsed.get("competency_assessment", {}),
        }
    return {"score": 5.0, "feedback": "Unable to generate feedback.", "criteria_scores": {}, "competency_assessment": {}}


async def process_answer(
    session: InterviewSession,
    transcript: str,
) -> Tuple[Optional[str], Dict[str, Any]]:
    """
    Process a candidate answer:
    1. Concurrently generate feedback + next question (saves ~3-5s)
    2. Store in conversation history
    3. Return (next_question_or_None, feedback_dict)
    """
    is_last = session.question_number >= session.max_questions - 1

    if is_last:
        # Last question — only generate feedback
        feedback = await generate_feedback(session, transcript)
        next_q = None
    else:
        # Concurrent calls — RAG + LLM for both simultaneously
        feedback_task = asyncio.create_task(generate_feedback(session, transcript))
        next_q_task = asyncio.create_task(generate_next_question(session, transcript))
        feedback, next_q = await asyncio.gather(feedback_task, next_q_task)

    # Store conversation record
    session.conversations.append({
        "question_number": session.question_number + 1,
        "question": session.current_question,
        "answer": transcript,
        "score": feedback["score"],
        "feedback": feedback["feedback"],
        "criteria_scores": feedback.get("criteria_scores", {}),
        "competency_assessment": feedback.get("competency_assessment", {}),
    })

    session.question_number += 1

    if next_q:
        session.current_question = next_q

    return next_q, feedback


def _voice_to_name(voice_code: str) -> str:
    """Map edge-tts voice code to a friendly name."""
    mapping = {
        "en-US-GuyNeural": "Alex",
        "en-US-AriaNeural": "Aria",
        "en-AU-NatashaNeural": "Natasha",
        "en-GB-SoniaNeural": "Sonia",
    }
    return mapping.get(voice_code, "Alex")
