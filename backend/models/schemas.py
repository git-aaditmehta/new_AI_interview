"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ─── Resume Upload ────────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    resume_id: str
    candidate_name: str
    resume_highlights: str
    message: str = "Resume processed successfully"


# ─── Interview ────────────────────────────────────────────────────────────────

class InterviewCreateRequest(BaseModel):
    resume_id: str
    job_description: str
    max_questions: int = Field(default=5, ge=1, le=10)
    ai_voice: str = Field(default="en-US-GuyNeural")
    candidate_name: str = Field(default="Candidate")


class InterviewCreateResponse(BaseModel):
    interview_id: int
    candidate_name: str
    status: str
    message: str = "Interview created. Connect via WebSocket to begin."


class QuestionSchema(BaseModel):
    id: int
    question_number: int
    question_text: str
    candidate_answer: Optional[str]
    score: Optional[float]
    feedback: Optional[str]
    criteria_scores: Optional[Dict[str, Any]]
    competency_assessment: Optional[Dict[str, Any]]

    model_config = {"from_attributes": True}


class InterviewDetailResponse(BaseModel):
    id: int
    candidate_name: str
    job_description: str
    overall_score: Optional[float]
    status: str
    max_questions: int
    ai_voice: str
    created_at: datetime
    questions: List[QuestionSchema] = []

    model_config = {"from_attributes": True}


class InterviewListItem(BaseModel):
    id: int
    candidate_name: str
    overall_score: Optional[float]
    status: str
    max_questions: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── WebSocket message protocol ───────────────────────────────────────────────

class WSMessage(BaseModel):
    """Base WebSocket message envelope."""
    type: str
    payload: Dict[str, Any] = {}


# ─── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
