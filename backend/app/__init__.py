from flask import Flask, jsonify

from .config import Config
from .extensions import cors, db, jwt, limiter, migrate
from .middleware.error_handler import APIError
from .models import TokenBlocklist
from .routes import ALL_BLUEPRINTS


def create_app(config_object=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)
    app.config["MAX_CONTENT_LENGTH"] = app.config.get("UPLOAD_MAX_CONTENT_LENGTH")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    for blueprint in ALL_BLUEPRINTS:
        app.register_blueprint(blueprint)

    @jwt.token_in_blocklist_loader
    def _token_blocklisted(_header, payload):
        return (
            TokenBlocklist.query.filter_by(jti=payload["jti"]).first() is not None
        )

    def _auth_error(message: str):
        return jsonify({"error": {"code": "unauthorized", "message": message}}), 401

    @jwt.unauthorized_loader
    def _on_unauthorized(message):
        return _auth_error(message)

    @jwt.invalid_token_loader
    def _on_invalid_token(message):
        return _auth_error("Invalid token")

    @jwt.expired_token_loader
    def _on_expired_token(_header, _payload):
        return _auth_error("Token has expired")

    @jwt.revoked_token_loader
    def _on_revoked_token(_header, _payload):
        return _auth_error("Token has been revoked")

    @jwt.needs_fresh_token_loader
    def _on_needs_fresh(_header, _payload):
        return _auth_error("Fresh token required")

    @jwt.token_verification_failed_loader
    def _on_verification_failed(_header, _payload):
        return _auth_error("Token verification failed")

    @jwt.user_lookup_error_loader
    def _on_user_lookup_error(_header, _payload):
        return _auth_error("User not found")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(APIError)
    def handle_api_error(err: APIError):
        return jsonify(err.to_dict()), err.status

    @app.errorhandler(404)
    def handle_404(_err):
        return jsonify({"error": {"code": "not_found", "message": "Resource not found"}}), 404

    @app.errorhandler(405)
    def handle_405(_err):
        return (
            jsonify({"error": {"code": "method_not_allowed", "message": "Method not allowed"}}),
            405,
        )

    @app.errorhandler(413)
    def handle_413(_err):
        return (
            jsonify({"error": {"code": "file_too_large", "message": "Uploaded file is too large"}}),
            413,
        )

    @app.errorhandler(429)
    def handle_429(_err):
        return (
            jsonify(
                {"error": {"code": "rate_limited", "message": "Too many requests — slow down"}}
            ),
            429,
        )

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        if isinstance(err, APIError):
            return jsonify(err.to_dict()), err.status
        app.logger.exception("Unhandled error")
        return (
            jsonify({"error": {"code": "server_error", "message": "Something went wrong"}}),
            500,
        )

    return app
