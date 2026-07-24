from datetime import datetime, timedelta, timezone
import re
import base64
import hashlib
import hmac
import secrets
import jwt
from app.core.settings import get_settings

settings = get_settings()
PBKDF2_ITERATIONS = 390000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    digest_b64 = base64.b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_b64}${digest_b64}"


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        scheme, iter_text, salt_b64, digest_b64 = password_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iter_text)
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected = base64.b64decode(digest_b64.encode("ascii"))
    except Exception:
        return False

    actual = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(actual, expected)


def create_access_token(*, subject: str, email: str, username: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expires_in_hours)
    payload = {
        "sub": subject,
        "email": email,
        "username": username,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


def normalize_phone_number(value: str | None) -> str | None:
    if not value:
        return None
    trimmed = value.strip()
    prefix = "+" if trimmed.startswith("+") else ""
    digits = re.sub(r"\D", "", trimmed)
    return f"{prefix}{digits}" if digits else None
