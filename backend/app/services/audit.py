"""Append-only audit trail.

Call record() for every sensitive action. Each call writes one row and commits
it straight away, so the entry survives even if the request is refused or fails
afterwards. The table itself refuses UPDATE, DELETE and TRUNCATE (migration 0003).

Rules for what goes in an entry:
- ids and short labels only, never passwords, tokens or free-text user input;
- sanitise_detail() enforces this as a second line of defence.
"""
import uuid
from typing import Any, Literal

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit_event import AuditEvent

Outcome = Literal["success", "denied", "failure"]

# A detail key containing any of these is dropped, whatever a caller passes.
_FORBIDDEN_KEY_PARTS = (
    "password",
    "passwd",
    "token",
    "secret",
    "authorization",
    "cookie",
    "hash",
    "key",
)
_MAX_KEYS = 20
_MAX_KEY_LENGTH = 64
_MAX_STRING_LENGTH = 200
_MAX_IP_LENGTH = 45


def sanitise_detail(detail: dict[str, Any] | None) -> dict[str, Any] | None:
    """Keep a detail dictionary small, flat and free of secret-looking keys."""
    if not detail:
        return None

    clean: dict[str, Any] = {}
    for key, value in list(detail.items())[:_MAX_KEYS]:
        name = str(key)[:_MAX_KEY_LENGTH]
        if any(part in name.lower() for part in _FORBIDDEN_KEY_PARTS):
            continue
        if isinstance(value, str):
            value = value[:_MAX_STRING_LENGTH]
        elif value is not None and not isinstance(value, (bool, int, float)):
            value = str(value)[:_MAX_STRING_LENGTH]
        clean[name] = value
    return clean or None


def client_ip(request: Request | None) -> str | None:
    """The address that connected to the server. Behind a reverse proxy this is
    the proxy's address, so it would need X-Forwarded-For handling there."""
    client = getattr(request, "client", None)
    host = getattr(client, "host", None)
    return host[:_MAX_IP_LENGTH] if isinstance(host, str) else None


def record(
    db: Session,
    *,
    action: str,
    outcome: Outcome,
    actor_user_id: uuid.UUID | None = None,
    entity_type: str | None = None,
    entity_id: uuid.UUID | str | None = None,
    request: Request | None = None,
    detail: dict[str, Any] | None = None,
) -> AuditEvent:
    """Write one audit entry and commit it immediately."""
    event = AuditEvent(
        action=action,
        outcome=outcome,
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=None if entity_id is None else str(entity_id)[:64],
        ip_address=client_ip(request),
        detail=sanitise_detail(detail),
    )
    db.add(event)
    db.commit()
    return event
