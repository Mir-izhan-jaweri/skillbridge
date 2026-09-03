from ..extensions import db


class DemandStat(db.Model):
    __tablename__ = "demand_stats"
    __table_args__ = (db.UniqueConstraint("skill_id", "period", name="uq_demand_period"),)

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    demand_score = db.Column(db.Integer, nullable=False, default=0)
    period = db.Column(db.String(20), nullable=False, default="2026-Q3")

    skill = db.relationship("Skill")

    def to_dict(self) -> dict:
        return {
            "skill": self.skill.name if self.skill else None,
            "demand_score": self.demand_score,
            "period": self.period,
        }
