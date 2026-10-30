"""Shared FastAPI dependencies: who is calling, and are they allowed."""
import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import AuthNotConfigured, decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.services import audit

# auto_error=False lets us return a consistent 401 instead of FastAPI's default.
bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the account behind a valid access token, or raise 401.

    The user is re-read from the database on every request, so a deactivated
    account or a changed role takes effect immediately."""
    if credentials is None:
        raise _unauthorized()

    try:
        payload = decode_access_token(credentials.credentials)
    except AuthNotConfigured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured. Set JWT_SECRET in backend/.env.",
        ) from None

    if payload is None:
        raise _unauthorized()

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError):
        raise _unauthorized() from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise _unauthorized()
    return user


def require_admin(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    if user.role != "Admin":
        # A signed-in person tried something reserved for administrators.
        audit.record(
            db,
            action="access.denied",
            outcome="denied",
            actor_user_id=user.id,
            request=request,
            detail={
                "required_role": "Admin",
                "method": request.method,
                "path": request.url.path,
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )
    return user
