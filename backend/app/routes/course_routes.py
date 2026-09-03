from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..middleware import auth_required, current_user
from ..models import Course, CourseEnrollment

bp = Blueprint("courses", __name__, url_prefix="/api/courses")


@bp.get("")
def list_courses():
    query = Course.query
    skill = request.args.get("skill", "").strip()
    if skill:
        query = query.filter(Course.skill.has(name=skill))
    search = request.args.get("search", "").strip()
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))

    courses = query.order_by(Course.title).all()

    user = None
    enrolled_ids: set[int] = set()
    try:
        user = current_user()
    except Exception:
        user = None
    if user is not None:
        enrolled_ids = {e.course_id for e in user.enrollments}

    items = []
    for course in courses:
        item = course.to_dict()
        item["enrolled"] = course.id in enrolled_ids
        items.append(item)
    return jsonify({"courses": items})


@bp.post("/<int:course_id>/enroll")
@auth_required
def enroll(course_id: int):
    course = Course.query.get_or_404(course_id)
    user = current_user()
    try:
        db.session.add(CourseEnrollment(user_id=user.id, course_id=course.id))
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Already enrolled", "course": course.to_dict()})
    return jsonify({"message": "Enrolled", "course": course.to_dict()}), 201
