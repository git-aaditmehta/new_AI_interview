"""
Async TTS service using edge-tts.
Replaces the old synchronous gTTS-based text_to_speech.py.
edge-tts is ~3x faster than gTTS and supports true async.

Usage:
    audio_bytes = await synthesize(text, voice="en-US-GuyNeural")
    b64 = base64.b64encode(audio_bytes).decode()
"""
import asyncio
import base64
import io
import edge_tts


VOICE_MAP = {
    "Alex (Male)": "en-US-GuyNeural",
    "Aria (Female)": "en-US-AriaNeural",
    "Natasha (Female)": "en-AU-NatashaNeural",
    "Sonia (Female)": "en-GB-SoniaNeural",
}

DEFAULT_VOICE = "en-US-GuyNeural"


async def synthesize(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """
    Convert text to speech using edge-tts.
    Returns raw MP3 bytes (no file written to disk).
    """
    # Resolve friendly name if passed
    resolved_voice = VOICE_MAP.get(voice, voice)

    communicate = edge_tts.Communicate(text, resolved_voice)
    audio_chunks: list[bytes] = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])

    return b"".join(audio_chunks)


async def synthesize_b64(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Convert text to speech and return as base64-encoded MP3 string.
    Drop-in replacement for the old speak_text() return value.
    """
    audio_bytes = await synthesize(text, voice)
    return base64.b64encode(audio_bytes).decode("utf-8")
