"""Tests for the audit helper. No database is needed: a stub session records
what would have been written."""
import uuid
from types import SimpleNamespace

from app.models.audit_event import AuditEvent
from app.services import audit


class StubSession:
    def __init__(self) -> None:
        self.added: list[AuditEvent] = []
        self.commits = 0

    def add(self, obj: AuditEvent) -> None:
        self.added.append(obj)

    def commit(self) -> None:
        self.commits += 1


def test_empty_detail_becomes_none():
    assert audit.sanitise_detail(None) is None
    assert audit.sanitise_detail({}) is None


def test_secret_looking_keys_are_dropped():
    detail = {
        "password": "hunter2",
        "access_token": "eyJ...",
        "Authorization": "Bearer eyJ...",
        "password_hash": "$argon2id$...",
        "api_key": "abc",
        "reason": "bad_password",
    }
    assert audit.sanitise_detail(detail) == {"reason": "bad_password"}


def test_only_secret_keys_leaves_none():
    assert audit.sanitise_detail({"password": "x"}) is None


def test_long_strings_are_truncated():
    clean = audit.sanitise_detail({"note": "x" * 1000})
    assert clean is not None
    assert len(clean["note"]) == 200


def test_other_types_become_strings_and_simple_ones_are_kept():
    clean = audit.sanitise_detail(
        {"count": 3, "ok": True, "ratio": 0.5, "nothing": None, "id": uuid.UUID(int=1)}
    )
    assert clean == {
        "count": 3,
        "ok": True,
        "ratio": 0.5,
        "nothing": None,
        "id": str(uuid.UUID(int=1)),
    }


def test_number_of_keys_is_limited():
    clean = audit.sanitise_detail({f"k{i}": i for i in range(50)})
    assert clean is not None
    assert len(clean) == 20


def test_record_adds_one_event_and_commits_once():
    db = StubSession()
    actor = uuid.uuid4()
    entity = uuid.uuid4()
    request = SimpleNamespace(client=SimpleNamespace(host="203.0.113.5"))

    event = audit.record(
        db,  # type: ignore[arg-type]
        action="employee.view",
        outcome="success",
        actor_user_id=actor,
        entity_type="employee",
        entity_id=entity,
        request=request,  # type: ignore[arg-type]
        detail={"viewed_other": True},
    )

    assert db.added == [event]
    assert db.commits == 1
    assert event.action == "employee.view"
    assert event.outcome == "success"
    assert event.actor_user_id == actor
    assert event.entity_type == "employee"
    assert event.entity_id == str(entity)
    assert event.ip_address == "203.0.113.5"
    assert event.detail == {"viewed_other": True}


def test_record_sanitises_detail_before_storing():
    db = StubSession()
    event = audit.record(
        db,  # type: ignore[arg-type]
        action="auth.login",
        outcome="failure",
        detail={"password": "hunter2", "reason": "bad_password"},
    )
    assert event.detail == {"reason": "bad_password"}


def test_record_without_a_request_stores_no_address():
    db = StubSession()
    event = audit.record(db, action="audit.view", outcome="success")  # type: ignore[arg-type]
    assert event.ip_address is None
    assert event.actor_user_id is None
    assert event.entity_id is None
