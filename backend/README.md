# HRIS backend

FastAPI + SQLAlchemy + PostgreSQL. Run every command below from the `backend/` folder.

## Setup

1. Create the database, for example `CREATE DATABASE hris;`.
2. Copy `.env.example` to `.env` and fill it in. `.env` is git-ignored: never commit it.
   - `DATABASE_URL`: keep the `postgresql+psycopg://` prefix.
   - `JWT_SECRET`: at least 32 random characters. Generate one with
     `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
3. Install and activate a virtual environment, then:

```powershell
pip install -r requirements.txt
```

## Database tables

```powershell
alembic upgrade head      # create or update the tables
python -m app.db.seed     # optional: load 12 sample employees
alembic downgrade base    # undo every migration (deletes the tables)
```

After changing a model, generate a migration with
`alembic revision --autogenerate -m "describe the change"` and read it before applying it.

## Logins

Every login account belongs to exactly one employee, and the employee's email is the
login name. Create accounts from the command line. The password is typed at a hidden
prompt and only an Argon2id hash is stored.

```powershell
python -m app.db.create_user --email grace.okafor@example.com --role Admin
python -m app.db.create_user --email noah.bennett@example.com --role Employee
python -m app.db.create_user --email noah.bennett@example.com --reset-password
```

Passwords must be 12 to 256 characters.

### Roles

| Role | Can do |
| ---- | ------ |
| Admin | List, read and create any employee |
| Employee | Read their own employee record only |

Anything not allowed is refused by default. Another person's record answers `404`, so the
API does not reveal which ids exist.

### Tokens

`POST /api/v1/auth/login` returns a short-lived access token (15 minutes by default,
`ACCESS_TOKEN_EXPIRE_MINUTES`). Send it as `Authorization: Bearer <token>`. The token holds
only the user id. The role and the active flag are read from the database on every request,
so a change takes effect at once.

## Run

```powershell
uvicorn app.main:app --reload
```

Interactive docs: http://127.0.0.1:8000/docs. Use **Authorize** and paste the token to try
the protected endpoints.

## Tests

```powershell
python -m pytest
```

## Endpoints

| Method | Path | Access | Description |
| ------ | ---- | ------ | ----------- |
| GET | `/api/v1/health` | public | Service check, no database |
| GET | `/api/v1/health/db` | public | Checks the PostgreSQL connection |
| POST | `/api/v1/auth/login` | public | Email and password in, access token out |
| GET | `/api/v1/auth/me` | any login | The current user |
| GET | `/api/v1/employees` | Admin | List employees. Optional `search`, `department`, `status` |
| GET | `/api/v1/employees/{id}` | Admin, or the employee themself | One employee |
| POST | `/api/v1/employees` | Admin | Create an employee (409 if the email exists) |

JSON uses camelCase (`startDate`, `accessToken`) to match `frontend/src/types/hr.ts`.

## Not built yet

Refresh tokens in httpOnly cookies, login rate limiting or lockout, password reset, token
revocation on logout and an audit log. Until the refresh flow exists, users sign in again
when the token expires.
