import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.audit_event import AuditEvent
from app.models.user import User
from app.schemas.audit import AuditEventRead
from app.services import audit
from app.services.audit import Outcome

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=list[AuditEventRead])
def list_audit_events(
    request: Request,
    action: str | None = Query(default=None, max_length=64),
    outcome: Outcome | None = None,
    actor_user_id: uuid.UUID | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Newest first. Administrators only. There is deliberately no endpoint to
    edit or delete an entry, and the table refuses it as well.

    Reading the log is itself recorded (audit.view)."""
    stmt = select(AuditEvent).order_by(AuditEvent.created_at.desc(), AuditEvent.id)
    if action is not None:
        stmt = stmt.where(AuditEvent.action == action)
    if outcome is not None:
        stmt = stmt.where(AuditEvent.outcome == outcome)
    if actor_user_id is not None:
        stmt = stmt.where(AuditEvent.actor_user_id == actor_user_id)

    events = [
        AuditEventRead.model_validate(event)
        for event in db.scalars(stmt.limit(limit).offset(offset))
    ]

    audit.record(
        db,
        action="audit.view",
        outcome="success",
        actor_user_id=admin.id,
        request=request,
        detail={"returned": len(events)},
    )
    return events
