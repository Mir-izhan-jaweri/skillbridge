from ..extensions import db


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    users = db.relationship("User", secondary="user_skills", back_populates="skills")

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name}


user_skills = db.Table(
    "user_skills",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    db.Column("skill_id", db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)
db.Index("ix_user_skills_user_id", user_skills.c.user_id)
