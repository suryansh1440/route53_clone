from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import LoginRequest, UserResponse
from app.services.auth_service import authenticate_user, get_user_by_id
from app.utils.security import create_session_token, get_session_user_id
from app.config import COOKIE_NAME, COOKIE_MAX_AGE

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Login with email and password. Sets session cookie and returns session token."""
    user = authenticate_user(db, data.email, data.password)
    token = create_session_token(user.id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="none",
        secure=True,
    )
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        token=token
    )


@router.post("/logout")
def logout(response: Response):
    """Logout by clearing the session cookie."""
    response.delete_cookie(key=COOKIE_NAME)
    return {"detail": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get the current authenticated user from session cookie or bearer token."""
    user_id = get_session_user_id(request)
    user = get_user_by_id(db, user_id)
    return user
