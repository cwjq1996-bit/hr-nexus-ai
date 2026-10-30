import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class AuditEventRead(BaseModel):
    # camelCase in JSON to match the frontend, like the other schemas.
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    id: uuid.UUID
    created_at: datetime
    actor_user_id: uuid.UUID | None
    action: str
    outcome: str
    entity_type: str | None
    entity_id: str | None
    ip_address: str | None
    detail: dict[str, Any] | None
