from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.utils.security import verify_password, hash_password


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate a user by email and password. Raises 401 on failure."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


def register_user(db: Session, name: str, email: str, password: str) -> User:
    """Register a new user. Raises 400 if email already exists."""
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    new_user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by ID. Raises 401 if not found."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
