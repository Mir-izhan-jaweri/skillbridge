"""Alibaba Cloud Qwen client (DashScope-compatible chat completions).

Isolated so it can be swapped or mocked. `AI_MOCK=true` (or a missing API key)
routes all calls to the deterministic mock instead of the network.
"""

import json

import requests
from flask import current_app

from . import mock


def _enabled() -> bool:
    cfg = current_app.config
    return not cfg["AI_MOCK"] and bool(cfg["ALIBABA_CLOUD_API_KEY"])


def _chat(messages: list[dict], timeout: int = 30) -> str:
    cfg = current_app.config
    resp = requests.post(
        f"{cfg['QWEN_BASE_URL'].rstrip('/')}/chat/completions",
        headers={
            "Authorization": f"Bearer {cfg['ALIBABA_CLOUD_API_KEY']}",
            "Content-Type": "application/json",
        },
        json={"model": cfg["QWEN_MODEL"], "messages": messages, "temperature": 0.3},
        timeout=timeout,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


def extract_skills(text: str) -> dict:
    """Return {"skills": [...], "summary": str} from free text / resume content."""
    if not _enabled():
        return mock.extract_skills(text)
    from .prompts import SKILL_EXTRACTION_SYSTEM, SKILL_EXTRACTION_USER

    try:
        raw = _chat(
            [
                {"role": "system", "content": SKILL_EXTRACTION_SYSTEM},
                {"role": "user", "content": SKILL_EXTRACTION_USER.format(text=text[:6000])},
            ]
        )
        data = _parse_json(raw)
        skills = [s.strip() for s in data.get("skills", []) if isinstance(s, str) and s.strip()]
        if not skills:
            raise ValueError("no skills returned")
        return {"skills": skills[:50], "summary": str(data.get("summary", ""))[:300]}
    except Exception:
        current_app.logger.warning("Qwen skill extraction failed; using mock fallback")
        return mock.extract_skills(text)


def generate_insight(skills: list[str], opportunities: list[str], gaps: list[str]) -> dict:
    """Return {"headline": str, "insight": str}."""
    if not _enabled():
        return mock.generate_insight(skills, opportunities, gaps)
    from .prompts import INSIGHT_SYSTEM, INSIGHT_USER

    try:
        raw = _chat(
            [
                {"role": "system", "content": INSIGHT_SYSTEM},
                {
                    "role": "user",
                    "content": INSIGHT_USER.format(
                        skills=", ".join(skills),
                        opportunities=", ".join(opportunities),
                        gaps=", ".join(gaps) or "none",
                    ),
                },
            ]
        )
        data = _parse_json(raw)
        return {
            "headline": str(data.get("headline", ""))[:120],
            "insight": str(data.get("insight", ""))[:500],
        }
    except Exception:
        current_app.logger.warning("Qwen insight generation failed; using mock fallback")
        return mock.generate_insight(skills, opportunities, gaps)


def counselor_reply(history: list[dict]) -> str:
    """Return the counselor's reply; `history` ends with the latest user message."""
    if not _enabled():
        return mock.counselor(history)
    from .prompts import CHAT_SYSTEM

    try:
        return _chat([{"role": "system", "content": CHAT_SYSTEM}, *history])[:2000]
    except Exception:
        current_app.logger.warning("Qwen counselor call failed; using mock fallback")
        return mock.counselor(history)
