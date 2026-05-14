import base64
import json
import os
import re
import asyncio
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_TIMEOUT_SECONDS = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "45"))
GEMINI_MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", "2"))


def _extract_model_json(text: str) -> Dict[str, Any]:
    cleaned = text.strip()

    # Handle markdown code fence output from the model.
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
        cleaned = re.sub(r"\n```$", "", cleaned)

    # Fallback: find first JSON object in free-form output.
    if not cleaned.startswith("{"):
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if match:
            cleaned = match.group(0)

    data = json.loads(cleaned)
    if not isinstance(data, dict):
        raise ValueError("Model response is not a JSON object")
    return data


async def classify_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Classify trash image via Google Gemini using GOOGLE_API_KEY from environment."""
    if not GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not configured")

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
        f"?key={GOOGLE_API_KEY}"
    )

    prompt = (
        "Klasifikasikan gambar sampah ini ke salah satu label berikut saja: "
        "organik, anorganik, b3, kertas, residu_bungkus. "
        "Jawab HANYA JSON valid dengan format: "
        '{"label":"<label>","confidence":<0-1>,"reason":"<singkat>"}'
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": b64}},
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
        },
    }

    raw: Dict[str, Any] = {}
    async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT_SECONDS) as client:
        for attempt in range(GEMINI_MAX_RETRIES + 1):
            resp = await client.post(endpoint, json=payload)

            if resp.status_code in (429, 503) and attempt < GEMINI_MAX_RETRIES:
                wait_seconds = 0.8 * (2 ** attempt)
                await asyncio.sleep(wait_seconds)
                continue

            if resp.status_code >= 400:
                try:
                    err = resp.json()
                    msg = err.get("error", {}).get("message", "upstream_error")
                except Exception:
                    msg = "upstream_error"
                raise RuntimeError(f"Gemini API error {resp.status_code}: {msg}")

            raw = resp.json()
            break

    try:
        text = raw["candidates"][0]["content"]["parts"][0]["text"]
        parsed = _extract_model_json(text)
        return {
            "label": parsed.get("label", "unknown"),
            "confidence": float(parsed.get("confidence", 0.0)),
            "reason": parsed.get("reason", ""),
            "raw": raw,
        }
    except Exception:
        return {"label": "unknown", "confidence": 0.0, "reason": "parse_failed", "raw": raw}
