from datetime import datetime, timezone

from flask import Blueprint, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from ..extensions import db, limiter
from ..middleware import UnauthorizedError, ValidationError, validators
from ..models import Profile, TokenBlocklist, User
from ..services.auth_service import issue_tokens

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _set_refresh_cookie(response, token: str):
    response.set_cookie(
        "sb_refresh_token",
        token,
        httponly=True,
        samesite="Lax",
        max_age=30 * 24 * 3600,
        path="/api/auth",
    )
    return response


@bp.post("/signup")
@limiter.limit("10/minute")
def signup():
    data = validators.get_json_or_raise()
    validators.require_fields(data, ["name", "email", "password"])
    name = validators.validate_name(data["name"])
    email = validators.validate_email(data["email"])
    validators.validate_password(data["password"])

    if User.query.filter_by(email=email).first():
        raise ValidationError("An account with this email already exists")

    user = User(name=name, email=email)
    user.set_password(data["password"])
    db.session.add(user)
    db.session.flush()
    db.session.add(Profile(user_id=user.id))
    db.session.commit()

    tokens = issue_tokens(user)
    resp = jsonify({"user": user.to_dict(), "access_token": tokens["access_token"]})
    return _set_refresh_cookie(resp, tokens["refresh_token"]), 201


@bp.post("/login")
@limiter.limit("10/minute")
def login():
    data = validators.get_json_or_raise()
    validators.require_fields(data, ["email", "password"])
    email = validators.validate_email(data["email"])

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(data["password"]):
        raise UnauthorizedError("Invalid email or password")

    tokens = issue_tokens(user)
    resp = jsonify({"user": user.to_dict(), "access_token": tokens["access_token"]})
    return _set_refresh_cookie(resp, tokens["refresh_token"])


@bp.post("/refresh")
@jwt_required(refresh=True)
@limiter.limit("30/minute")
def refresh():
    identity = get_jwt_identity()
    token = create_access_token(identity=identity)
    return jsonify({"access_token": token})


@bp.post("/logout")
@jwt_required()
def logout():
    claims = get_jwt()
    db.session.add(
        TokenBlocklist(
            jti=claims["jti"],
            token_type=claims["type"],
            user_id=int(get_jwt_identity()),
            expires_at=datetime.fromtimestamp(claims["exp"], tz=timezone.utc),
        )
    )
    db.session.commit()
    resp = jsonify({"message": "Logged out"})
    resp.delete_cookie("sb_refresh_token", path="/api/auth")
    return resp
