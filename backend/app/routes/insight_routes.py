from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import DemandStat

bp = Blueprint("insights", __name__, url_prefix="/api/insights")


@bp.get("/demand")
def demand():
    period = request.args.get("period", "").strip()
    query = DemandStat.query
    if period:
        query = query.filter_by(period=period)
    else:
        latest = db.session.query(db.func.max(DemandStat.period)).scalar()
        if latest:
            query = query.filter_by(period=latest)

    stats = query.order_by(DemandStat.demand_score.desc()).all()
    periods = [
        p for (p,) in db.session.query(DemandStat.period).distinct().order_by(DemandStat.period)
    ]
    return jsonify(
        {
            "period": stats[0].period if stats else None,
            "periods": periods,
            "demand": [s.to_dict() for s in stats],
        }
    )
