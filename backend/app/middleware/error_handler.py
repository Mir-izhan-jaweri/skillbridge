class APIError(Exception):
    """Application error rendered as {"error": {"code", "message"}}."""

    def __init__(self, message: str, code: str = "error", status: int = 400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status

    def to_dict(self) -> dict:
        return {"error": {"code": self.code, "message": self.message}}


class ValidationError(APIError):
    def __init__(self, message: str):
        super().__init__(message, code="validation_error", status=422)


class UnauthorizedError(APIError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, code="unauthorized", status=401)


class ForbiddenError(APIError):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, code="forbidden", status=403)


class NotFoundError(APIError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, code="not_found", status=404)
