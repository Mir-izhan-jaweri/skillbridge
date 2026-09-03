from ..extensions import db
from .user import utcnow

opportunity_skills = db.Table(
    "opportunity_skills",
    db.Column(
        "opportunity_id",
        db.Integer,
        db.ForeignKey("opportunities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "skill_id", db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    ),
)


class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False, default="")
    type = db.Column(db.String(20), nullable=False, default="freelance")  # freelance | job
    source = db.Column(db.String(80), nullable=False, default="")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    required_skills = db.relationship("Skill", secondary=opportunity_skills)
    applications = db.relationship(
        "Application", back_populates="opportunity", cascade="all, delete-orphan"
    )

    def to_dict(self, match_score: int | None = None) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "type": self.type,
            "source": self.source,
            "required_skills": [s.name for s in self.required_skills],
            "match_score": match_score,
        }


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    opportunity_id = db.Column(
        db.Integer,
        db.ForeignKey("opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )
    match_score = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default="saved")  # saved | applied | rejected | hired
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    user = db.relationship("User", back_populates="applications")
    opportunity = db.relationship("Opportunity", back_populates="applications")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "opportunity_id": self.opportunity_id,
            "opportunity": self.opportunity.to_dict(match_score=self.match_score),
            "match_score": self.match_score,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
