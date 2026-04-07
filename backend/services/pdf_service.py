"""
PDF Service — extracts and chunks resume text for RAG ingestion.

Flow:
  1. Extract raw text from PDF bytes using pypdf
  2. Split into semantic chunks using RecursiveCharacterTextSplitter
  3. Return list of chunks ready for embedding & storage in ChromaDB
"""
import io
from typing import List

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter


# Text splitter config — tuned for resume documents
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,          # ~300-400 tokens per chunk
    chunk_overlap=80,        # overlap for context continuity
    separators=["\n\n", "\n", ". ", " ", ""],
)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF given as raw bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages)


def chunk_resume_text(raw_text: str) -> List[str]:
    """
    Split resume text into semantic chunks for embedding.
    Returns a list of text chunks.
    """
    if not raw_text or not raw_text.strip():
        return []
    chunks = _splitter.split_text(raw_text)
    # Filter out very short chunks (< 30 chars) — usually noise
    return [c.strip() for c in chunks if len(c.strip()) >= 30]


def extract_and_chunk(pdf_bytes: bytes) -> tuple[str, List[str]]:
    """
    Full pipeline: PDF bytes → (raw_text, chunks).
    Returns both so raw_text can be stored in DB.
    """
    raw_text = extract_text_from_pdf(pdf_bytes)
    chunks = chunk_resume_text(raw_text)
    return raw_text, chunks
