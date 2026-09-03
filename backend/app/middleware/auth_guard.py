from functools import wraps

from flask_jwt_extended import verify_jwt_in_request

from .error_handler import ForbiddenError, UnauthorizedError


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)

    return wrapper


def auth_optional(fn):
    """Attach the user identity when a valid token is present, else None."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
        except Exception:
            pass
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _current_user_or_raise()
        if not user.is_admin:
            raise ForbiddenError()
        return fn(*args, **kwargs)

    return wrapper


def _current_user_or_raise():
    from ..models import User

    verify_jwt_in_request()
    user = User.query.get(int(request_jwt_identity()))
    if user is None:
        raise UnauthorizedError("Account no longer exists")
    return user


def request_jwt_identity() -> str | None:
    from flask_jwt_extended import get_jwt_identity

    try:
        return get_jwt_identity()
    except RuntimeError:
        return None


def current_user():
    """Return the authenticated user or None (for auth_optional routes)."""
    from ..models import User

    identity = request_jwt_identity()
    if identity is None:
        return None
    return User.query.get(int(identity))
