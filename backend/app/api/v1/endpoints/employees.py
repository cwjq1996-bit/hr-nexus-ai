import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import (
    Department,
    EmployeeCreate,
    EmployeeRead,
    EmploymentStatus,
)
from app.services import audit

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[EmployeeRead])
def list_employees(
    request: Request,
    search: str | None = Query(default=None, max_length=100),
    department: Department | None = None,
    employment_status: EmploymentStatus | None = Query(default=None, alias="status"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List employees (administrators only), optionally filtered."""
    stmt = select(Employee).order_by(Employee.name)

    term = search.strip() if search else ""
    if term:
        stmt = stmt.where(
            or_(
                Employee.name.icontains(term, autoescape=True),
                Employee.email.icontains(term, autoescape=True),
                Employee.role.icontains(term, autoescape=True),
            )
        )
    if department is not None:
        stmt = stmt.where(Employee.department == department)
    if employment_status is not None:
        stmt = stmt.where(Employee.status == employment_status)

    employees = list(db.scalars(stmt))

    # Listing everyone is bulk access to personal data. The search text itself
    # is not stored, only whether a filter was used.
    audit.record(
        db,
        action="employee.list",
        outcome="success",
        actor_user_id=admin.id,
        entity_type="employee",
        request=request,
        detail={
            "count": len(employees),
            "filtered": bool(term or department or employment_status),
        },
    )
    return employees


@router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(
    employee_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """An administrator can read any employee. Anyone else can read only their
    own record. Other ids answer 404 rather than 403, so the API does not
    reveal which ids exist.

    Reading your own record is not logged. An administrator reading someone
    else's record, and anyone being refused, is."""
    not_found = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found."
    )
    is_admin = current_user.role == "Admin"
    is_self = current_user.employee_id == employee_id

    if not is_admin and not is_self:
        audit.record(
            db,
            action="employee.view",
            outcome="denied",
            actor_user_id=current_user.id,
            entity_type="employee",
            entity_id=employee_id,
            request=request,
        )
        raise not_found

    employee = db.get(Employee, employee_id)
    if employee is None:
        raise not_found

    if not is_self:
        audit.record(
            db,
            action="employee.view",
            outcome="success",
            actor_user_id=current_user.id,
            entity_type="employee",
            entity_id=employee_id,
            request=request,
            detail={"viewed_other": True},
        )
    return employee


@router.post("", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    def refuse_duplicate() -> HTTPException:
        audit.record(
            db,
            action="employee.create",
            outcome="failure",
            actor_user_id=admin.id,
            entity_type="employee",
            request=request,
            detail={"reason": "duplicate_email"},
        )
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with this email already exists.",
        )

    duplicate = db.scalar(select(Employee.id).where(Employee.email == payload.email))
    if duplicate is not None:
        raise refuse_duplicate()

    employee = Employee(**payload.model_dump())
    db.add(employee)
    try:
        db.commit()
    except IntegrityError:
        # Two requests with the same email can race past the check above.
        db.rollback()
        raise refuse_duplicate()
    db.refresh(employee)

    audit.record(
        db,
        action="employee.create",
        outcome="success",
        actor_user_id=admin.id,
        entity_type="employee",
        entity_id=employee.id,
        request=request,
    )
    return employee
