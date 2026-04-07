"""
Interview REST API routes.

Endpoints:
  POST /api/interviews/upload-resume  — parse PDF, ingest RAG, extract name
  POST /api/interviews/               — create an interview session record
  GET  /api/interviews/               — list all interviews
  GET  /api/interviews/{id}           — get interview detail with questions
  DELETE /api/interviews/{id}         — delete interview
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from models.db_models import Interview, Question
from models.schemas import (
    InterviewCreateRequest,
    InterviewCreateResponse,
    InterviewDetailResponse,
    InterviewListItem,
    ResumeUploadResponse,
)
from prompts.templates import BASIC_DETAILS_PROMPT
from services.llm_service import get_llm_json
from services.pdf_service import extract_and_chunk
from services.rag_service import delete_resume, ingest_resume

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


# ── Upload Resume ─────────────────────────────────────────────────────────────

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    1. Read PDF bytes
    2. Extract text + chunk for RAG
    3. Ingest chunks into ChromaDB
    4. Call LLM to extract candidate name + highlights
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract and chunk
    raw_text, chunks = extract_and_chunk(pdf_bytes)
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    # Generate a stable resume_id
    resume_id = uuid.uuid4().hex[:16]

    # Ingest into ChromaDB
    ingest_resume(resume_id, chunks)

    # Extract name + highlights via LLM
    prompt = BASIC_DETAILS_PROMPT.format(resume_content=raw_text[:4000])
    parsed = await get_llm_json(prompt)

    candidate_name = "Candidate"
    resume_highlights = ""
    if parsed:
        candidate_name = parsed.get("name", "Candidate") or "Candidate"
        resume_highlights = parsed.get("resume_highlights", "") or ""

    return ResumeUploadResponse(
        resume_id=resume_id,
        candidate_name=candidate_name,
        resume_highlights=resume_highlights,
    )


# ── Create Interview ──────────────────────────────────────────────────────────

@router.post("/", response_model=InterviewCreateResponse, status_code=201)
async def create_interview(
    data: InterviewCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new interview record in the database."""
    interview = Interview(
        candidate_name=data.candidate_name,
        job_description=data.job_description,
        resume_text="",          # raw text not re-stored (already in ChromaDB)
        resume_id=data.resume_id,
        status="pending",
        max_questions=data.max_questions,
        ai_voice=data.ai_voice,
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)

    return InterviewCreateResponse(
        interview_id=interview.id,
        candidate_name=interview.candidate_name,
        status=interview.status,
    )


# ── List Interviews ───────────────────────────────────────────────────────────

@router.get("/", response_model=List[InterviewListItem])
async def list_interviews(db: AsyncSession = Depends(get_db)):
    """Return all interviews ordered by creation date (newest first)."""
    result = await db.execute(
        select(Interview).order_by(Interview.created_at.desc())
    )
    interviews = result.scalars().all()
    return interviews


# ── Get Interview Detail ──────────────────────────────────────────────────────

@router.get("/{interview_id}", response_model=InterviewDetailResponse)
async def get_interview(interview_id: int, db: AsyncSession = Depends(get_db)):
    """Return full interview detail including all questions."""
    result = await db.execute(
        select(Interview)
        .options(selectinload(Interview.questions))
        .where(Interview.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")
    return interview


# ── Delete Interview ──────────────────────────────────────────────────────────

@router.delete("/{interview_id}", status_code=204)
async def delete_interview(interview_id: int, db: AsyncSession = Depends(get_db)):
    """Delete interview and its ChromaDB collection."""
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    # Remove from ChromaDB
    if interview.resume_id:
        delete_resume(interview.resume_id)

    await db.delete(interview)
    await db.commit()
