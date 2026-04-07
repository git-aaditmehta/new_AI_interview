"""
STT service using Speechmatics.
Replaces the old transcript_audio.py which created a new WebSocket per call.

This service wraps the existing Speechmatics batch approach but runs it
asynchronously in a thread pool so it doesn't block FastAPI.
"""
import asyncio
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from speechmatics.models import TranscriptionConfig, ServerMessageType
import speechmatics.client

from core.config import settings

_executor = ThreadPoolExecutor(max_workers=2)


def _transcribe_sync(audio_bytes: bytes, language: str = "en") -> str:
    """
    Blocking Speechmatics transcription.
    Runs in thread pool.
    """
    api_key = settings.speechmatics_api_key
    if not api_key:
        raise ValueError("SPEECHMATICS_API_KEY is not set")

    sm_client = speechmatics.client.WebsocketClient(api_key)
    results: list[str] = []
    lock = threading.Lock()

    def on_transcript(message):
        if "results" in message:
            parts = []
            for result in message["results"]:
                if "alternatives" in result:
                    if result["type"] == "word":
                        if parts:
                            parts.append(" ")
                        parts.append(result["alternatives"][0]["content"])
                    elif result["type"] == "punctuation":
                        parts.append(result["alternatives"][0]["content"])
            if parts:
                with lock:
                    results.append("".join(parts))

    sm_client.add_event_handler(
        event_name=ServerMessageType.AddTranscript,
        event_handler=on_transcript,
    )

    conf = TranscriptionConfig(
        language=language,
        enable_partials=False,
        max_delay=5,
    )

    import io
    sm_client.run_synchronously(io.BytesIO(audio_bytes), conf)

    return " ".join(results).strip() if results else ""


async def transcribe(audio_bytes: bytes, language: str = "en") -> str:
    """
    Async transcription — runs blocking Speechmatics call in thread pool.

    Args:
        audio_bytes: Raw WAV/audio bytes
        language: Language code (default 'en')

    Returns:
        Transcribed text string
    """
    loop = asyncio.get_event_loop()
    try:
        transcript = await loop.run_in_executor(
            _executor, _transcribe_sync, audio_bytes, language
        )
        return transcript
    except Exception as e:
        print(f"[STTService] Transcription error: {e}")
        raise RuntimeError(f"Transcription failed: {e}") from e
