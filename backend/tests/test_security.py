"""Tests for password hashing and access tokens. No database is needed."""
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.core import security
from app.core.config import settings

SECRET = "s" * 48


@pytest.fixture(autouse=True)
def configured_secret(monkeypatch):
    monkeypatch.setattr(settings, "jwt_secret", SECRET)
    monkeypatch.setattr(settings, "access_token_expire_minutes", 15)


def _forge(secret: str = SECRET, **overrides) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": str(uuid.uuid4()),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    claims.update(overrides)
    return jwt.encode(claims, secret, algorithm="HS256")


def test_hash_is_argon2id_and_verifies():
    password_hash = security.hash_password("a long enough passphrase")
    assert password_hash.startswith("$argon2id$")
    assert security.verify_password("a long enough passphrase", password_hash)
    assert not security.verify_password("a different passphrase", password_hash)


def test_hashing_the_same_password_twice_gives_different_hashes():
    first = security.hash_password("a long enough passphrase")
    second = security.hash_password("a long enough passphrase")
    assert first != second


def test_verify_rejects_a_malformed_hash():
    assert not security.verify_password("anything", "not-a-hash")


def test_token_round_trip_carries_the_user_id():
    user_id = uuid.uuid4()
    payload = security.decode_access_token(security.create_access_token(user_id))
    assert payload is not None
    assert payload["sub"] == str(user_id)


def test_token_does_not_carry_the_role():
    payload = security.decode_access_token(security.create_access_token(uuid.uuid4()))
    assert payload is not None
    assert "role" not in payload


def test_tampered_token_is_rejected():
    token = security.create_access_token(uuid.uuid4())
    assert security.decode_access_token(token[:-2] + "xx") is None


def test_token_signed_with_another_secret_is_rejected():
    assert security.decode_access_token(_forge(secret="o" * 48)) is None


def test_expired_token_is_rejected():
    past = datetime.now(timezone.utc) - timedelta(minutes=1)
    assert security.decode_access_token(_forge(exp=past)) is None


def test_token_of_the_wrong_type_is_rejected():
    assert security.decode_access_token(_forge(type="refresh")) is None


def test_token_without_an_expiry_is_rejected():
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {"sub": str(uuid.uuid4()), "type": "access", "iat": now},
        SECRET,
        algorithm="HS256",
    )
    assert security.decode_access_token(token) is None


def test_unsigned_token_is_rejected():
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=5),
        },
        None,
        algorithm="none",
    )
    assert security.decode_access_token(token) is None


def test_missing_secret_is_reported(monkeypatch):
    monkeypatch.setattr(settings, "jwt_secret", None)
    assert not security.auth_configured()
    with pytest.raises(security.AuthNotConfigured):
        security.create_access_token(uuid.uuid4())


def test_short_secret_is_reported(monkeypatch):
    monkeypatch.setattr(settings, "jwt_secret", "too-short")
    assert not security.auth_configured()
    with pytest.raises(security.AuthNotConfigured):
        security.decode_access_token("anything")
