from flask import Blueprint, jsonify, request

from ..ai import client as ai
from ..middleware import auth_required, current_user, validators
from ..services import matching_service, resume_service

bp = Blueprint("skills", __name__, url_prefix="/api/skills")


@bp.post("/analyze")
@auth_required
def analyze():
    """Accept JSON ({skills|text}) or multipart with a `resume` file."""
    user = current_user()
    text = ""
    skills_in: list[str] = []

    if "resume" in request.files:
        text = resume_service.extract_text(request.files["resume"])
        form_skills = request.form.get("skills", "")
        if form_skills:
            skills_in = validators.validate_skill_list(form_skills)
    else:
        data = validators.get_json_or_raise()
        if data.get("skills"):
            skills_in = validators.validate_skill_list(data["skills"])
        elif data.get("text"):
            text = str(data["text"]).strip()[:8000]
            if not text:
                raise validators.ValidationError("Provide skills, text, or a resume")
        else:
            raise validators.ValidationError("Provide skills, text, or a resume")

    summary = ""
    if text:
        result = ai.extract_skills(text)
        extracted = result["skills"]
        summary = result["summary"]
        merged = skills_in + [s for s in extracted if s not in skills_in]
        skills_in = merged[:50]

    matching_service.sync_user_skills(user, skills_in)
    recommendations = matching_service.build_recommendations(user)
    if summary:
        recommendations["summary"] = summary
    return jsonify(recommendations)
