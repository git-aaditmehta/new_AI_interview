"""
Async LLM service — wraps LiteLLM with async support.
Replaces the old synchronous utils/llm_call.py.
"""
import asyncio
import json
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, Optional

from litellm import completion
from core.config import settings

# Set API key env vars that LiteLLM reads from environment
os.environ["MISTRAL_API_KEY"] = settings.mistral_api_key

# Thread pool for blocking LiteLLM calls
_executor = ThreadPoolExecutor(max_workers=6)


def _sync_llm_call(prompt: str, model: str) -> str:
    """Blocking LLM call — runs in thread pool."""
    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


async def get_llm_response(prompt: str, model: Optional[str] = None) -> str:
    """
    Async wrapper around LiteLLM completion.
    Runs the blocking call in a thread pool so it doesn't block the event loop.
    """
    target_model = model or settings.llm_model
    loop = asyncio.get_event_loop()
    try:
        raw = await loop.run_in_executor(_executor, _sync_llm_call, prompt, target_model)
        return raw
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {e}") from e


def parse_json_response(response: str) -> Optional[Dict[str, Any]]:
    """
    Clean and parse a JSON string returned by the LLM.
    Handles ```json ... ``` fences.
    """
    try:
        if not response:
            return None
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, Exception) as e:
        print(f"[LLMService] JSON parse error: {e}\nRaw: {response[:300]}")
        return None


async def get_llm_json(prompt: str, model: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Call LLM and return parsed JSON dict."""
    raw = await get_llm_response(prompt, model)
    return parse_json_response(raw)
