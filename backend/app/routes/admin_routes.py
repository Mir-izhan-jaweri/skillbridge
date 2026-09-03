from flask import Blueprint, jsonify, request

from ..extensions import db
from ..middleware import admin_required, validators
from ..models import Application, Course, CourseEnrollment, Opportunity, Skill, User

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.get("/users")
@admin_required
def list_users():
    query = User.query
    search = request.args.get("search", "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(User.name.ilike(like), User.email.ilike(like)))
    users = query.order_by(User.created_at.desc()).all()
    return jsonify(
        {
            "users": [
                {**u.to_dict(), "skills": len(u.skills), "applications": len(u.applications)}
                for u in users
            ]
        }
    )


@bp.delete("/users/<int:user_id>")
@admin_required
def delete_user(user_id: int):
    user = User.query.get_or_404(user_id)
    if user.is_admin:
        return jsonify({"error": {"code": "forbidden", "message": "Cannot delete an admin"}}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})


@bp.get("/analytics")
@admin_required
def analytics():
    signups = [
        {"date": str(d), "count": c}
        for d, c in db.session.query(
            db.func.date(User.created_at), db.func.count(User.id)
        ).group_by(db.func.date(User.created_at)).order_by(db.func.date(User.created_at))
    ]

    most_matched = [
        {"skill": s.name, "count": c}
        for s, c in (
            db.session.query(Skill, db.func.count(Application.id))
            .join(Opportunity.required_skills)
            .join(Application, Application.opportunity_id == Opportunity.id)
            .group_by(Skill.id)
            .order_by(db.func.count(Application.id).desc())
            .limit(8)
        )
    ]

    most_enrolled = [
        {"course": co.title, "count": c}
        for co, c in (
            db.session.query(Course, db.func.count(CourseEnrollment.id))
            .join(CourseEnrollment, CourseEnrollment.course_id == Course.id)
            .group_by(Course.id)
            .order_by(db.func.count(CourseEnrollment.id).desc())
            .limit(8)
        )
    ]

    return jsonify(
        {
            "totals": {
                "users": User.query.count(),
                "opportunities": Opportunity.query.count(),
                "courses": Course.query.count(),
                "applications": Application.query.count(),
            },
            "signups_over_time": signups,
            "most_matched_skills": most_matched,
            "most_enrolled_courses": most_enrolled,
        }
    )


# --- Opportunity management -------------------------------------------------


def _opp_payload(data: dict, opp: Opportunity | None = None) -> Opportunity:
    validators.require_fields(data, ["title", "type"])
    if data["type"] not in ("freelance", "job"):
        raise validators.ValidationError("type must be 'freelance' or 'job'")
    opp = opp or Opportunity()
    opp.title = str(data["title"]).strip()[:200]
    opp.type = data["type"]
    opp.description = str(data.get("description", "")).strip()[:4000]
    opp.source = str(data.get("source", "")).strip()[:80]
    if "required_skills" in data:
        names = validators.validate_skill_list(data["required_skills"])
        skills = []
        for name in names:
            skill = Skill.query.filter(db.func.lower(Skill.name) == name.lower()).first()
            if not skill:
                skill = Skill(name=name)
                db.session.add(skill)
                db.session.flush()
            skills.append(skill)
        opp.required_skills = skills
    return opp


@bp.get("/opportunities")
@admin_required
def list_opportunities():
    opps = Opportunity.query.order_by(Opportunity.created_at.desc()).all()
    return jsonify({"opportunities": [o.to_dict() for o in opps]})


@bp.post("/opportunities")
@admin_required
def create_opportunity():
    opp = _opp_payload(validators.get_json_or_raise())
    db.session.add(opp)
    db.session.commit()
    return jsonify({"opportunity": opp.to_dict()}), 201


@bp.put("/opportunities/<int:opp_id>")
@admin_required
def update_opportunity(opp_id: int):
    opp = Opportunity.query.get_or_404(opp_id)
    opp = _opp_payload(validators.get_json_or_raise(), opp)
    db.session.commit()
    return jsonify({"opportunity": opp.to_dict()})


@bp.delete("/opportunities/<int:opp_id>")
@admin_required
def delete_opportunity(opp_id: int):
    opp = Opportunity.query.get_or_404(opp_id)
    db.session.delete(opp)
    db.session.commit()
    return jsonify({"message": "Opportunity deleted"})


# --- Course management -------------------------------------------------------


def _course_payload(data: dict, course: Course | None = None) -> Course:
    validators.require_fields(data, ["title"])
    course = course or Course()
    course.title = str(data["title"]).strip()[:200]
    course.provider = str(data.get("provider", "")).strip()[:120]
    course.duration = str(data.get("duration", "")).strip()[:60]
    course.url = str(data.get("url", "")).strip()[:500]
    if "skill" in data:
        skill_name = str(data["skill"]).strip()
        if skill_name:
            skill = Skill.query.filter(db.func.lower(Skill.name) == skill_name.lower()).first()
            if not skill:
                skill = Skill(name=skill_name)
                db.session.add(skill)
                db.session.flush()
            course.skill_id = skill.id
        else:
            course.skill_id = None
    return course


@bp.get("/courses")
@admin_required
def list_courses():
    courses = Course.query.order_by(Course.title).all()
    return jsonify({"courses": [c.to_dict() for c in courses]})


@bp.post("/courses")
@admin_required
def create_course():
    course = _course_payload(validators.get_json_or_raise())
    db.session.add(course)
    db.session.commit()
    return jsonify({"course": course.to_dict()}), 201


@bp.put("/courses/<int:course_id>")
@admin_required
def update_course(course_id: int):
    course = Course.query.get_or_404(course_id)
    course = _course_payload(validators.get_json_or_raise(), course)
    db.session.commit()
    return jsonify({"course": course.to_dict()})


@bp.delete("/courses/<int:course_id>")
@admin_required
def delete_course(course_id: int):
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})
