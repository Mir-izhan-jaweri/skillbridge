from flask import Blueprint, jsonify, request

from ..ai import client as ai
from ..extensions import limiter
from ..middleware import validators

bp = Blueprint("chat", __name__, url_prefix="/api/chat")

MAX_MESSAGE_LEN = 1000
MAX_HISTORY = 12


def _validate_history(raw) -> list[dict]:
    if not raw:
        return []
    if not isinstance(raw, list):
        raise validators.ValidationError("conversation_history must be a list")
    history = []
    for entry in raw[-MAX_HISTORY:]:
        if not isinstance(entry, dict):
            raise validators.ValidationError("Each history entry must be an object")
        role = entry.get("role")
        content = str(entry.get("content", "")).strip()
        if role not in ("user", "assistant") or not content:
            raise validators.ValidationError("Each history entry needs role and content")
        history.append({"role": role, "content": content[:MAX_MESSAGE_LEN]})
    return history


@bp.post("/message")
@limiter.limit("10/minute")
def message():
    data = validators.get_json_or_raise()
    message_text = str(data.get("message", "")).strip()
    if not message_text:
        raise validators.ValidationError("Message must not be empty")
    if len(message_text) > MAX_MESSAGE_LEN:
        raise validators.ValidationError(f"Message must be under {MAX_MESSAGE_LEN} characters")

    history = _validate_history(data.get("conversation_history"))
    reply = ai.counselor_reply([*history, {"role": "user", "content": message_text}])
    return jsonify({"reply": reply})
