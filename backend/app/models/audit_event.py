import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, Index, String, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditEvent(Base):
    """One row per sensitive action. The table is append-only: the database
    refuses UPDATE, DELETE and TRUNCATE on it (see migration 0003).

    actor_user_id and entity_id are deliberately plain values with no foreign
    key. An audit record has to outlive the account or record it describes,
    and a foreign key action would need an UPDATE or DELETE on this table."""

    __tablename__ = "audit_events"
    __table_args__ = (
        CheckConstraint(
            "outcome IN ('success', 'denied', 'failure')",
            name="ck_audit_events_outcome",
        ),
        Index("ix_audit_events_created_at", "created_at"),
        Index("ix_audit_events_actor_user_id", "actor_user_id"),
        Index("ix_audit_events_action", "action"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    # Null when nobody is signed in, for example an unknown-email login attempt.
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    action: Mapped[str] = mapped_column(String(64))
    outcome: Mapped[str] = mapped_column(String(16))
    entity_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    entity_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    detail: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
