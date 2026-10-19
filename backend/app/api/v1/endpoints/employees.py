import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
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

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get(
    "",
    response_model=list[EmployeeRead],
    dependencies=[Depends(require_admin)],
)
def list_employees(
    search: str | None = Query(default=None, max_length=100),
    department: Department | None = None,
    employment_status: EmploymentStatus | None = Query(default=None, alias="status"),
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

    return list(db.scalars(stmt))


@router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """An administrator can read any employee. Anyone else can read only their
    own record. Other ids answer 404 rather than 403, so the API does not
    reveal which ids exist."""
    not_found = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found."
    )
    if current_user.role != "Admin" and current_user.employee_id != employee_id:
        raise not_found

    employee = db.get(Employee, employee_id)
    if employee is None:
        raise not_found
    return employee


@router.post(
    "",
    response_model=EmployeeRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    duplicate = db.scalar(select(Employee.id).where(Employee.email == payload.email))
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with this email already exists.",
        )

    employee = Employee(**payload.model_dump())
    db.add(employee)
    try:
        db.commit()
    except IntegrityError:
        # Two requests with the same email can race past the check above.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with this email already exists.",
        )
    db.refresh(employee)
    return employee
