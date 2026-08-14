import bcrypt
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from fastapi import Request, HTTPException

from app.config import SECRET_KEY, COOKIE_NAME

serializer = URLSafeTimedSerializer(SECRET_KEY)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_session_token(user_id: int) -> str:
    """Create a signed session token containing the user ID."""
    return serializer.dumps({"user_id": user_id})


def verify_session_token(token: str, max_age: int = 60 * 60 * 24 * 7) -> dict | None:
    """Verify and decode a session token. Returns None if invalid/expired."""
    try:
        return serializer.loads(token, max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None


def get_session_user_id(request: Request) -> int:
    """Extract user ID from session cookie or Authorization header. Raises 401 if invalid."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    data = verify_session_token(token)
    if not data or "user_id" not in data:
        raise HTTPException(status_code=401, detail="Session expired")

    return data["user_id"]
