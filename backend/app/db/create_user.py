"""Create (or reset) the login account of an existing employee.

Run from the backend/ folder:

    python -m app.db.create_user --email grace.okafor@example.com --role Admin
    python -m app.db.create_user --email noah.bennett@example.com --role Employee
    python -m app.db.create_user --email noah.bennett@example.com --reset-password

The password is typed at a hidden prompt. It is never passed on the command
line, so it does not end up in your shell history, and it is never stored in
plain text: only an Argon2id hash goes into the database.
"""
import argparse
import getpass
from contextlib import contextmanager

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import get_db
from app.models.employee import Employee
from app.models.user import User

MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 256


def prompt_for_password() -> str:
    password = getpass.getpass(f"Password (at least {MIN_PASSWORD_LENGTH} characters): ")
    if len(password) < MIN_PASSWORD_LENGTH:
        raise SystemExit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    if len(password) > MAX_PASSWORD_LENGTH:
        raise SystemExit(f"Password must be at most {MAX_PASSWORD_LENGTH} characters.")
    if getpass.getpass("Repeat password: ") != password:
        raise SystemExit("The passwords do not match.")
    return password


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--email", required=True, help="the employee's email address")
    parser.add_argument("--role", choices=["Admin", "Employee"], default="Employee")
    parser.add_argument(
        "--reset-password",
        action="store_true",
        help="set a new password for an employee who already has a login",
    )
    args = parser.parse_args()

    if settings.database_url is None:
        raise SystemExit("DATABASE_URL is not set. Add it to backend/.env first.")

    email = args.email.strip().lower()

    with contextmanager(get_db)() as db:
        employee = db.scalar(select(Employee).where(Employee.email == email))
        if employee is None:
            raise SystemExit(
                f"No employee has the email {email}. Add the employee first "
                "(python -m app.db.seed loads the samples)."
            )

        user = db.scalar(select(User).where(User.employee_id == employee.id))

        if user is not None and not args.reset_password:
            raise SystemExit(
                f"{employee.name} already has a login. "
                "Use --reset-password to change the password."
            )
        if user is None and args.reset_password:
            raise SystemExit(f"{employee.name} has no login yet. Leave out --reset-password.")

        password = prompt_for_password()

        if user is None:
            db.add(
                User(
                    employee_id=employee.id,
                    password_hash=hash_password(password),
                    role=args.role,
                )
            )
            action = f"Created a{'n' if args.role == 'Admin' else ''} {args.role} login for"
        else:
            user.password_hash = hash_password(password)
            action = "Reset the password for"
        db.commit()

    print(f"{action} {employee.name} ({email}).")


if __name__ == "__main__":
    main()
