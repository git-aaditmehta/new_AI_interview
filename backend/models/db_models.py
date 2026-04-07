"""
SQLAlchemy ORM models — maps to SQLite tables.
Tables: interviews, questions
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    candidate_name: Mapped[str] = mapped_column(String(200))
    job_description: Mapped[str] = mapped_column(Text)
    resume_text: Mapped[str] = mapped_column(Text)          # raw extracted text
    resume_id: Mapped[Optional[str]] = mapped_column(String(100))  # ChromaDB collection id
    overall_score: Mapped[Optional[float]] = mapped_column(Float, default=None)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending | active | completed
    max_questions: Mapped[int] = mapped_column(Integer, default=5)
    ai_voice: Mapped[str] = mapped_column(String(100), default="en-US-GuyNeural")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    questions: Mapped[list["Question"]] = relationship("Question", back_populates="interview", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    interview_id: Mapped[int] = mapped_column(ForeignKey("interviews.id", ondelete="CASCADE"))
    question_number: Mapped[int] = mapped_column(Integer)
    question_text: Mapped[str] = mapped_column(Text)
    candidate_answer: Mapped[Optional[str]] = mapped_column(Text, default=None)
    score: Mapped[Optional[float]] = mapped_column(Float, default=None)
    feedback: Mapped[Optional[str]] = mapped_column(Text, default=None)
    criteria_scores: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    competency_assessment: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    interview: Mapped["Interview"] = relationship("Interview", back_populates="questions")
