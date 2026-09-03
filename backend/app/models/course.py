from ..extensions import db
from .user import utcnow


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(120), nullable=False, default="")
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="SET NULL"))
    duration = db.Column(db.String(60), nullable=False, default="")
    url = db.Column(db.String(500), nullable=False, default="")

    skill = db.relationship("Skill")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "provider": self.provider,
            "skill": self.skill.name if self.skill else None,
            "duration": self.duration,
            "url": self.url,
        }


class CourseEnrollment(db.Model):
    __tablename__ = "course_enrollments"
    __table_args__ = (db.UniqueConstraint("user_id", "course_id", name="uq_enrollment"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id = db.Column(
        db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    user = db.relationship("User", back_populates="enrollments")
    course = db.relationship("Course")
