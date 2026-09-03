from flask import Blueprint, jsonify

from ..extensions import db
from ..middleware import auth_required, current_user, validators
from ..models import Skill

bp = Blueprint("profile", __name__, url_prefix="/api")


def _profile_payload(user) -> dict:
    return {
        "user": user.to_dict(),
        "profile": user.profile.to_dict() if user.profile else {},
        "skills": [s.name for s in user.skills],
    }


@bp.get("/profile")
@auth_required
def get_profile():
    return jsonify(_profile_payload(current_user()))


@bp.put("/profile")
@auth_required
def update_profile():
    user = current_user()
    data = validators.get_json_or_raise()

    if "name" in data:
        user.name = validators.validate_name(data["name"])
    if "bio" in data:
        user.profile.bio = str(data["bio"])[:2000]
    if "location" in data:
        user.profile.location = str(data["location"]).strip()[:120]
    if "skills" in data:
        names = validators.validate_skill_list(data["skills"])
        skills = []
        for name in names:
            skill = Skill.query.filter(db.func.lower(Skill.name) == name.lower()).first()
            if not skill:
                skill = Skill(name=name)
                db.session.add(skill)
                db.session.flush()
            skills.append(skill)
        user.skills = skills

    db.session.commit()
    return jsonify(_profile_payload(user))
