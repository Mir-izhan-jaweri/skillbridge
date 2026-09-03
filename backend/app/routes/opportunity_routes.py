from flask import Blueprint, jsonify, request

from ..extensions import db
from ..middleware import auth_optional, auth_required, current_user, validators
from ..models import Application, Opportunity
from ..services import matching_service

bp = Blueprint("opportunities", __name__, url_prefix="/api/opportunities")


@bp.get("")
@auth_optional
def list_opportunities():
    query = Opportunity.query

    type_ = request.args.get("type", "").strip()
    if type_ in ("freelance", "job"):
        query = query.filter_by(type=type_)

    search = request.args.get("search", "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(Opportunity.title.ilike(like), Opportunity.description.ilike(like))
        )

    skill = request.args.get("skill", "").strip()
    if skill:
        query = query.filter(Opportunity.required_skills.any(name=skill))

    opportunities = query.order_by(Opportunity.created_at.desc()).all()
    scores = matching_service.match_scores_for(current_user(), opportunities)

    items = []
    for opp in opportunities:
        saved = False
        user = current_user()
        if user is not None:
            saved = Application.query.filter_by(
                user_id=user.id, opportunity_id=opp.id
            ).first() is not None
        item = opp.to_dict(match_score=scores.get(opp.id))
        item["saved"] = saved
        items.append(item)

    if scores:
        items.sort(key=lambda o: o["match_score"] or 0, reverse=True)

    return jsonify({"opportunities": items})


@bp.post("/<int:opp_id>/save")
@auth_required
def save_opportunity(opp_id: int):
    opp = Opportunity.query.get_or_404(opp_id)
    user = current_user()
    score = matching_service.score_opportunity({s.id for s in user.skills}, opp)
    app = matching_service.record_application(user, opp, score)
    return jsonify({"application": app.to_dict()}), 201
