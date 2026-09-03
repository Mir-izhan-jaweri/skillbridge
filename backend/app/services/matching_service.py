"""Skill-to-opportunity matching and recommendation logic (deterministic)."""

from ..extensions import db
from ..models import Application, Course, DemandStat, Opportunity, Skill, User
from ..ai import client as ai


def sync_user_skills(user: User, skill_names: list[str]) -> list[Skill]:
    skills = []
    for name in skill_names:
        skill = Skill.query.filter(db.func.lower(Skill.name) == name.lower()).first()
        if not skill:
            skill = Skill(name=name)
            db.session.add(skill)
            db.session.flush()
        if skill not in user.skills:
            user.skills.append(skill)
        skills.append(skill)
    db.session.commit()
    return skills


def score_opportunity(user_skill_ids: set[int], opp: Opportunity) -> int:
    required = {s.id for s in opp.required_skills}
    if not required:
        return 0
    matched = len(required & user_skill_ids)
    base = round(100 * matched / len(required))
    # Weight partially-matched roles by market demand of their matched skills.
    demand = {
        d.skill_id: d.demand_score
        for d in DemandStat.query.filter(DemandStat.skill_id.in_(required)).all()
    }
    if matched and demand:
        avg_demand = sum(demand.get(sid, 50) for sid in required & user_skill_ids) / matched
        base = min(100, int(base + (avg_demand - 50) / 10))
    return base


def build_recommendations(user: User) -> dict:
    user_skill_ids = {s.id for s in user.skills}
    opportunities = Opportunity.query.all()

    scored = [
        (score_opportunity(user_skill_ids, opp), opp)
        for opp in opportunities
        if user_skill_ids & {s.id for s in opp.required_skills}
    ]
    scored.sort(key=lambda pair: pair[0], reverse=True)
    matches = [
        opp.to_dict(match_score=score)
        for score, opp in scored[:12]
        if score >= 25
    ]

    gaps = _skill_gaps(user_skill_ids, scored[:5])
    insight = ai.generate_insight(
        [s.name for s in user.skills],
        [m["title"] for m in matches[:3]],
        [g["skill"] for g in gaps],
    )

    return {
        "skills": [s.name for s in user.skills],
        "summary": _summary_for(user),
        "opportunities": matches,
        "gaps": gaps,
        "insight": insight,
    }


def _skill_gaps(user_skill_ids: set[int], top_scored: list[tuple[int, Opportunity]]) -> list[dict]:
    gap_counter: dict[int, str] = {}
    for _score, opp in top_scored:
        for skill in opp.required_skills:
            if skill.id not in user_skill_ids:
                gap_counter.setdefault(skill.id, skill.name)

    gaps = []
    for skill_id, name in gap_counter.items():
        course = Course.query.filter_by(skill_id=skill_id).first()
        gaps.append(
            {
                "skill": name,
                "recommended_course": course.to_dict() if course else None,
            }
        )
    return gaps[:6]


def _summary_for(user: User) -> str:
    n = len(user.skills)
    if n == 0:
        return "Add your skills to unlock personalized recommendations."
    return f"Profile with {n} skill(s) matched against live opportunities."


def match_scores_for(user: User | None, opportunities: list[Opportunity]) -> dict[int, int]:
    if user is None or not user.skills:
        return {}
    ids = {s.id for s in user.skills}
    return {opp.id: score_opportunity(ids, opp) for opp in opportunities}


def record_application(user: User, opp: Opportunity, match_score: int) -> Application:
    app = Application.query.filter_by(user_id=user.id, opportunity_id=opp.id).first()
    if app:
        app.status = "applied" if app.status == "saved" else app.status
        app.match_score = match_score
    else:
        app = Application(user=user, opportunity=opp, match_score=match_score, status="saved")
        db.session.add(app)
    db.session.commit()
    return app
