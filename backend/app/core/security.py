"""Password hashing (Argon2id) and access-token helpers."""
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.core.config import settings

ALGORITHM = "HS256"
MIN_SECRET_LENGTH = 32
ACCESS_TOKEN_TYPE = "access"

# argon2-cffi's PasswordHasher uses Argon2id with the library's recommended
# default cost parameters.
_hasher = PasswordHasher()

# A real hash of a throwaway value. Verifying against it when no account
# matches an email keeps the response time similar to a wrong password, so
# the login endpoint does not reveal which emails have accounts.
_DUMMY_HASH = _hasher.hash("timing-equaliser-not-a-real-password")


class AuthNotConfigured(Exception):
    """JWT_SECRET is missing or too short."""


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def verify_dummy_password(password: str) -> None:
    verify_password(password, _DUMMY_HASH)


def password_needs_rehash(password_hash: str) -> bool:
    try:
        return _hasher.check_needs_rehash(password_hash)
    except InvalidHashError:
        return False


def auth_configured() -> bool:
    secret = settings.jwt_secret
    return bool(secret) and len(secret) >= MIN_SECRET_LENGTH


def _secret() -> str:
    secret = settings.jwt_secret
    if not secret or len(secret) < MIN_SECRET_LENGTH:
        raise AuthNotConfigured(
            f"JWT_SECRET must be set to at least {MIN_SECRET_LENGTH} characters."
        )
    return secret


def create_access_token(user_id: uuid.UUID) -> str:
    """Sign a short-lived token. It carries only the user id: the role is
    always read from the database, so a role change takes effect at once."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": ACCESS_TOKEN_TYPE,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Return the token's claims, or None if it is invalid, expired or of the
    wrong type. Raises AuthNotConfigured if the server has no secret."""
    secret = _secret()
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub"]},
        )
    except jwt.PyJWTError:
        return None
    if payload.get("type") != ACCESS_TOKEN_TYPE:
        return None
    return payload
