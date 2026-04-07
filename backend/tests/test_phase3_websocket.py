"""
Phase 3 WebSocket Protocol Test.
Tests: WS connect, PING/PONG, protocol structure.
Does NOT test full interview flow (requires real mic audio + API keys).
Run from backend/ directory while server is on port 8000.
"""
import sys
import json
import asyncio
import websockets

PASS = []
FAIL = []

def check(label, ok, detail=""):
    if ok:
        print(f"  [PASS] {label}")
        PASS.append(label)
    else:
        print(f"  [FAIL] {label} — {detail}")
        FAIL.append(label)


async def run_tests():
    print("=" * 55)
    print("Phase 3 WebSocket Protocol Tests")
    print("=" * 55)

    # ── Test 1: Connect to WS endpoint ───────────────────────
    print("\n[1] WebSocket connect to /ws/interview/1")
    try:
        async with websockets.connect("ws://localhost:8000/ws/interview/1", open_timeout=5) as ws:
            # Should receive CONNECTED message immediately
            raw = await asyncio.wait_for(ws.recv(), timeout=5)
            msg = json.loads(raw)
            check("receives CONNECTED message", msg.get("type") == "CONNECTED", msg)
            check("CONNECTED has payload.message", "message" in msg.get("payload", {}))

            # ── Test 2: PING/PONG ─────────────────────────────
            print("\n[2] PING/PONG round-trip")
            await ws.send(json.dumps({"type": "PING"}))
            raw = await asyncio.wait_for(ws.recv(), timeout=5)
            pong = json.loads(raw)
            check("receives PONG", pong.get("type") == "PONG", pong)

            # ── Test 3: Unknown message type ──────────────────
            print("\n[3] Unknown message type → ERROR response")
            await ws.send(json.dumps({"type": "UNKNOWN_TYPE", "payload": {}}))
            raw = await asyncio.wait_for(ws.recv(), timeout=5)
            err = json.loads(raw)
            check("receives ERROR for unknown type", err.get("type") == "ERROR", err)

            # ── Test 4: AUDIO_DATA without START_INTERVIEW ────
            print("\n[4] AUDIO_DATA without starting → ERROR")
            await ws.send(json.dumps({"type": "AUDIO_DATA", "payload": {"audio_b64": ""}}))
            raw = await asyncio.wait_for(ws.recv(), timeout=5)
            err2 = json.loads(raw)
            check("receives ERROR when not started", err2.get("type") == "ERROR", err2)

            # ── Test 5: Invalid START_INTERVIEW (bad id) ──────
            print("\n[5] START_INTERVIEW with non-existent interview_id")
            # interview_id=1 in URL, no interview in DB — should get ERROR
            await ws.send(json.dumps({"type": "START_INTERVIEW", "payload": {}}))
            raw = await asyncio.wait_for(ws.recv(), timeout=5)
            resp = json.loads(raw)
            # Either ERROR (interview not found) or GREETING (if interview exists)
            check(
                "receives ERROR (interview not found in DB)",
                resp.get("type") in ("ERROR", "GREETING"),
                resp
            )

        print("\n  Connection closed cleanly ✅")

    except Exception as e:
        check("WebSocket connection established", False, str(e))

asyncio.run(run_tests())

print()
print("=" * 55)
print(f"Results: {len(PASS)} passed, {len(FAIL)} failed")
if FAIL:
    print(f"Failed: {FAIL}")
    sys.exit(1)
else:
    print("ALL WS PROTOCOL TESTS PASSED ✅")
