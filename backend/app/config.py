import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


def _csv_origins(value: str) -> list[str]:
    return [o.strip() for o in value.split(",") if o.strip()]


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///skillbridge.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "30"))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))
    )
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE", "false").lower() == "true"
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_REFRESH_COOKIE_NAME = "sb_refresh_token"
    JWT_ERROR_MESSAGE_KEY = "message"

    CORS_ORIGINS = _csv_origins(os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"))

    ALIBABA_CLOUD_API_KEY = os.getenv("ALIBABA_CLOUD_API_KEY", "")
    QWEN_MODEL = os.getenv("QWEN_MODEL", "qwen-plus")
    QWEN_BASE_URL = os.getenv(
        "QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    AI_MOCK = os.getenv("AI_MOCK", "true").lower() == "true"

    RATELIMIT_DEFAULT = os.getenv("RATELIMIT_DEFAULT", "200/hour")
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

    UPLOAD_MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB resume cap
