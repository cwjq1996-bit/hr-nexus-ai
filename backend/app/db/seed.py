"""Load the sample employees used by the frontend dashboard into the database.

Run from the backend/ folder:

    python -m app.db.seed

Safe to run more than once: employees whose email already exists are skipped.
All names and emails are fictional.
"""
from contextlib import contextmanager
from datetime import date

from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.models.employee import Employee

# (name, email, role, department, status, start date)
SAMPLE_EMPLOYEES = [
    ("Amelia Hart", "amelia.hart@example.com", "Engineering Manager", "Engineering", "Active", date(2021, 2, 8)),
    ("Noah Bennett", "noah.bennett@example.com", "Software Engineer", "Engineering", "Active", date(2022, 6, 20)),
    ("Priya Shah", "priya.shah@example.com", "Data Engineer", "Engineering", "On leave", date(2023, 1, 16)),
    ("Lucas Moreau", "lucas.moreau@example.com", "Frontend Developer", "Engineering", "Probation", date(2026, 8, 24)),
    ("Grace Okafor", "grace.okafor@example.com", "HR Business Partner", "People", "Active", date(2020, 9, 14)),
    ("Ethan Clarke", "ethan.clarke@example.com", "Talent Acquisition Lead", "People", "Active", date(2022, 3, 7)),
    ("Sofia Rossi", "sofia.rossi@example.com", "Account Executive", "Sales", "Active", date(2023, 5, 2)),
    ("Oliver Grant", "oliver.grant@example.com", "Sales Development Rep", "Sales", "Probation", date(2026, 9, 7)),
    ("Hannah Lee", "hannah.lee@example.com", "Operations Coordinator", "Operations", "Active", date(2021, 11, 29)),
    ("Mateo Alvarez", "mateo.alvarez@example.com", "Facilities Manager", "Operations", "On leave", date(2019, 4, 15)),
    ("Isla Murray", "isla.murray@example.com", "Financial Controller", "Finance", "Active", date(2020, 1, 20)),
    ("Daniel Foster", "daniel.foster@example.com", "Payroll Analyst", "Finance", "Active", date(2024, 7, 1)),
]


def main() -> None:
    if settings.database_url is None:
        raise SystemExit("DATABASE_URL is not set. Add it to backend/.env first.")

    with contextmanager(get_db)() as db:
        existing_emails = set(db.scalars(select(Employee.email)))
        new_employees = [
            Employee(
                name=name,
                email=email,
                role=role,
                department=department,
                status=status,
                start_date=start_date,
            )
            for name, email, role, department, status, start_date in SAMPLE_EMPLOYEES
            if email not in existing_emails
        ]
        db.add_all(new_employees)
        db.commit()

    skipped = len(SAMPLE_EMPLOYEES) - len(new_employees)
    print(f"Added {len(new_employees)} employees, skipped {skipped} that already existed.")


if __name__ == "__main__":
    main()
