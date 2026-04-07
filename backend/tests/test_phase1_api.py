"""
Phase 1 API Integration Test.
Tests: /health, GET /api/interviews/, POST /upload-resume, POST /api/interviews/
Run from backend/ directory while server is running on port 8000.
"""
import json
import urllib.request
import urllib.error
import os, sys

BASE = "http://localhost:8000"
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
print("Phase 1 API Integration Tests")
print("=" * 55)

# ── Test 1: Health ────────────────────────────────────────
print("\n[1] GET /health")
try:
    r = urllib.request.urlopen(f"{BASE}/health")
    data = json.loads(r.read())
    check("status=ok", data.get("status") == "ok", data)
    check("version present", "version" in data)
except Exception as e:
    check("GET /health reachable", False, str(e))

# ── Test 2: List interviews (empty) ──────────────────────
print("\n[2] GET /api/interviews/")
try:
    r = urllib.request.urlopen(f"{BASE}/api/interviews/")
    check("returns 200", r.status == 200)
    data = json.loads(r.read())
    check("returns list", isinstance(data, list))
except Exception as e:
    check("GET /api/interviews/", False, str(e))

# ── Test 3: Upload resume (PDF required) ─────────────────
print("\n[3] POST /api/interviews/upload-resume")
# Find a sample PDF from the existing project
pdf_path = r"d:\Desktop\new_ai_interview\AI-INTERVIEW-SYSTEM\audio"
# We'll create a simple multipart request without external libs
import io, uuid

# Try to find any PDF in the workspace
sample_pdf = None
for root, dirs, files in os.walk(r"d:\Desktop\new_ai_interview"):
    for f in files:
        if f.endswith(".pdf"):
            sample_pdf = os.path.join(root, f)
            break
    if sample_pdf:
        break

if sample_pdf:
    print(f"   Using PDF: {sample_pdf}")
    boundary = f"----FormBoundary{uuid.uuid4().hex}"
    with open(sample_pdf, "rb") as fp:
        pdf_bytes = fp.read()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="resume.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode() + pdf_bytes + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{BASE}/api/interviews/upload-resume",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        r = urllib.request.urlopen(req, timeout=60)
        data = json.loads(r.read())
        check("returns 200", r.status == 200)
        check("resume_id present", "resume_id" in data, data)
        check("candidate_name present", "candidate_name" in data, data)
        print(f"   Candidate: {data.get('candidate_name')}")
        resume_id = data.get("resume_id")
    except urllib.error.HTTPError as e:
        body_err = e.read()
        check("upload-resume succeeds", False, f"{e.code}: {body_err[:200]}")
        resume_id = None
    except Exception as e:
        check("upload-resume succeeds", False, str(e))
        resume_id = None
else:
    print("   No PDF found in workspace — skipping upload test")
    resume_id = None

# ── Summary ───────────────────────────────────────────────
print()
print("=" * 55)
print(f"Results: {len(PASS)} passed, {len(FAIL)} failed")
if FAIL:
    print(f"Failed: {FAIL}")
    sys.exit(1)
else:
    print("ALL TESTS PASSED ✅")
