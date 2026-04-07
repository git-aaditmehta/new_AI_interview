"""
Phase 2 RAG Pipeline Test.
Tests: PDF chunking, ChromaDB ingestion, retrieval.
Run from backend/ directory.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PASS = []
FAIL = []

def check(label, ok, detail=""):
    if ok:
        print(f"  [PASS] {label}")
        PASS.append(label)
    else:
        print(f"  [FAIL] {label} — {detail}")
        FAIL.append(label)

print("=" * 55)
print("Phase 2 RAG Pipeline Tests")
print("=" * 55)

# ── Test 1: PDF Service ───────────────────────────────────
print("\n[1] pdf_service: text extraction + chunking")
from services.pdf_service import extract_text_from_pdf, chunk_resume_text, extract_and_chunk

# Create a minimal fake PDF using pypdf
import io
from pypdf import PdfWriter

writer = PdfWriter()
writer.add_blank_page(width=612, height=792)
buf = io.BytesIO()
writer.write(buf)
fake_pdf_bytes = buf.getvalue()

# Real test with actual text
sample_text = """
John Doe
Software Engineer | Python Developer

EXPERIENCE
Senior Software Engineer at TechCorp (2020-2024)
- Led team of 8 engineers building microservices in Python/FastAPI
- Reduced API response time by 60% through caching optimization
- Deployed 15+ services on AWS using Kubernetes

Software Engineer at StartupXYZ (2018-2020)
- Built ML pipeline for fraud detection (95% accuracy)
- Increased revenue by $2M through recommendation system

SKILLS
Python, FastAPI, Django, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, TensorFlow

EDUCATION
B.S. Computer Science, MIT (2018)
"""

chunks = chunk_resume_text(sample_text)
check("chunk_resume_text returns chunks", len(chunks) > 0, f"got {len(chunks)} chunks")
check("no empty chunks", all(len(c) >= 30 for c in chunks), "some chunks too short")
check("reasonable chunk count (2-20)", 2 <= len(chunks) <= 20, f"got {len(chunks)}")
print(f"   {len(chunks)} chunks | first: '{chunks[0][:80]}...'")

# ── Test 2: ChromaDB Ingestion ────────────────────────────
print("\n[2] rag_service: ingest chunks into ChromaDB")
from services.rag_service import ingest_resume, retrieve_context, delete_resume
import uuid

test_resume_id = f"test-{uuid.uuid4().hex[:8]}"
num_stored = ingest_resume(test_resume_id, chunks)
check("ingest returns correct count", num_stored == len(chunks), f"stored={num_stored}, expected={len(chunks)}")
print(f"   Stored {num_stored} chunks under resume_id={test_resume_id}")

# ── Test 3: Retrieval ─────────────────────────────────────
print("\n[3] rag_service: retrieve relevant chunks")

context1 = retrieve_context(test_resume_id, "Python and machine learning experience", top_k=3)
check("retrieval returns non-empty string", bool(context1), context1[:100])
check("retrieved context contains relevant terms", 
      any(kw in context1.lower() for kw in ["python", "ml", "engineer", "experience"]),
      f"context: {context1[:200]}")

context2 = retrieve_context(test_resume_id, "AWS Kubernetes deployment", top_k=2)
check("second retrieval also returns context", bool(context2))

print(f"   Retrieved context (preview): '{context1[:150]}...'")

# ── Cleanup ───────────────────────────────────────────────
delete_resume(test_resume_id)
print(f"\n   Cleaned up test collection: {test_resume_id}")

# ── Summary ───────────────────────────────────────────────
print()
print("=" * 55)
print(f"Results: {len(PASS)} passed, {len(FAIL)} failed")
if FAIL:
    print(f"Failed: {FAIL}")
    sys.exit(1)
else:
    print("ALL RAG TESTS PASSED ✅")
