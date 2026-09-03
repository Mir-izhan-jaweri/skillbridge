import re

from flask import request

from .error_handler import ValidationError

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def get_json_or_raise() -> dict:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object")
    return data


def require_fields(data: dict, fields: list[str]) -> None:
    missing = [f for f in fields if not str(data.get(f, "")).strip()]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}")


def validate_email(email: str) -> str:
    email = (email or "").strip().lower()
    if not EMAIL_RE.match(email) or len(email) > 255:
        raise ValidationError("Enter a valid email address")
    return email


def validate_password(password: str) -> None:
    if len(password) < 8 or len(password) > 128:
        raise ValidationError("Password must be between 8 and 128 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise ValidationError("Password must contain at least one letter and one number")


def validate_name(name: str) -> str:
    name = (name or "").strip()
    if len(name) < 2 or len(name) > 120:
        raise ValidationError("Name must be between 2 and 120 characters")
    return name


def validate_skill_list(raw) -> list[str]:
    if isinstance(raw, str):
        raw = [s.strip() for s in re.split(r"[,;\n]", raw)]
    if not isinstance(raw, list):
        raise ValidationError("skills must be a list of strings")
    skills = []
    for item in raw:
        if not isinstance(item, str):
            raise ValidationError("Each skill must be a string")
        name = item.strip()
        if name and len(name) <= 80 and name not in skills:
            skills.append(name)
    if not skills:
        raise ValidationError("Provide at least one skill")
    if len(skills) > 50:
        raise ValidationError("Too many skills (max 50)")
    return skills
