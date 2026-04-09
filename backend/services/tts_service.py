"""
Async TTS service.

Primary provider: Azure Speech (reliable, requires AZURE_SPEECH_KEY + AZURE_SPEECH_REGION)
Fallback: edge-tts (best-effort; may 403 depending on network/region).
"""
import base64
import os
from typing import Optional

import edge_tts

from core.config import settings


VOICE_MAP = {
    "Alex (Male)": "en-US-GuyNeural",
    "Aria (Female)": "en-US-AriaNeural",
    "Natasha (Female)": "en-AU-NatashaNeural",
    "Sonia (Female)": "en-GB-SoniaNeural",
}

DEFAULT_VOICE = "en-US-GuyNeural"


async def synthesize(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """
    Convert text to speech.

    If Azure Speech is configured, uses Azure and returns MP3 bytes.
    Otherwise falls back to edge-tts.
    Returns raw MP3 bytes (no file written to disk).
    """
    if settings.azure_speech_key and settings.azure_speech_region:
        return await _synthesize_azure(text, voice)

    return await _synthesize_edge(text, voice)


async def _synthesize_edge(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """Best-effort edge-tts synthesis (may fail with 403)."""
    resolved_voice = VOICE_MAP.get(voice, voice)
    communicate = edge_tts.Communicate(text, resolved_voice)
    audio_chunks: list[bytes] = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])

    return b"".join(audio_chunks)


async def _synthesize_azure(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """
    Azure Speech synthesis.

    Uses thread offloading internally (SDK is blocking).
    """
    import asyncio

    # Lazy import so the backend can still run without Azure SDK installed
    import azure.cognitiveservices.speech as speechsdk

    resolved_voice = VOICE_MAP.get(voice, voice)

    speech_config = speechsdk.SpeechConfig(
        subscription=settings.azure_speech_key,
        region=settings.azure_speech_region,
    )
    speech_config.speech_synthesis_voice_name = resolved_voice
    # MP3 output to match frontend expectations (data:audio/mp3;base64,...)
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=None,  # memory output (no speaker)
    )

    def _run_sync() -> bytes:
        result = synthesizer.speak_text_async(text).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return bytes(result.audio_data)
        # Include cancellation reason/details if available
        if result.reason == speechsdk.ResultReason.Canceled:
            details = speechsdk.SpeechSynthesisCancellationDetails.from_result(result)
            raise RuntimeError(f"Azure TTS canceled: {details.reason} {details.error_details}")
        raise RuntimeError(f"Azure TTS failed: {result.reason}")

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_sync)


async def synthesize_b64(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Convert text to speech and return as base64-encoded MP3 string.
    Drop-in replacement for the old speak_text() return value.
    """
    try:
        audio_bytes = await synthesize(text, voice)
        if not audio_bytes:
            return ""
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        # TTS is best-effort; don't break interviews if provider fails.
        print(f"[TTSService] TTS failed (continuing without audio): {e}")
        return ""
