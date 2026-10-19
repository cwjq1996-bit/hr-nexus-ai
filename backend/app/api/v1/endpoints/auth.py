from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    auth_configured,
    create_access_token,
    hash_password,
    password_needs_rehash,
    verify_dummy_password,
    verify_password,
)
from app.db.session import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.auth import CurrentUser, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _current_user_schema(user: User) -> CurrentUser:
    return CurrentUser(
        id=user.id,
        employee_id=user.employee_id,
        name=user.employee.name,
        email=user.employee.email,
        role=user.role,
    )


def _invalid_credentials() -> HTTPException:
    # One message for every failure, so it never reveals whether the email
    # exists, the password was wrong or the account is switched off.
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if not auth_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured. Set JWT_SECRET in backend/.env.",
        )

    email = payload.email.strip().lower()
    user = db.scalar(
        select(User)
        .join(Employee, User.employee_id == Employee.id)
        .where(Employee.email == email)
    )

    if user is None:
        verify_dummy_password(payload.password)
        raise _invalid_credentials()

    password_ok = verify_password(payload.password, user.password_hash)
    if not password_ok or not user.is_active:
        raise _invalid_credentials()

    # Upgrade the stored hash if the hashing settings have been strengthened.
    if password_needs_rehash(user.password_hash):
        user.password_hash = hash_password(payload.password)
        db.commit()

    return TokenResponse(
        access_token=create_access_token(user.id),
        expires_in=settings.access_token_expire_minutes * 60,
        user=_current_user_schema(user),
    )


@router.get("/me", response_model=CurrentUser)
def read_me(user: User = Depends(get_current_user)):
    return _current_user_schema(user)
