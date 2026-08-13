from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.utils.security import verify_password


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate a user by email and password. Raises 401 on failure."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by ID. Raises 401 if not found."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
