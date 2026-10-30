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
| Admin | List, read and create any employee, and read the audit log |
| Employee | Read their own employee record only |

Anything not allowed is refused by default. Another person's record answers `404`, so the
API does not reveal which ids exist.

### Tokens

`POST /api/v1/auth/login` returns a short-lived access token (15 minutes by default,
`ACCESS_TOKEN_EXPIRE_MINUTES`). Send it as `Authorization: Bearer <token>`. The token holds
only the user id. The role and the active flag are read from the database on every request,
so a change takes effect at once.

## Audit log

Sensitive actions are written to the `audit_events` table, one row each, and committed
immediately so an entry survives even when the request is refused or fails afterwards.

| Action | Outcome | Recorded when |
| ------ | ------- | ------------- |
| `auth.login` | success, failure | Every sign-in attempt. A failure carries a reason (`unknown_email`, `bad_password`, `inactive`) |
| `access.denied` | denied | A signed-in non-administrator calls an administrator-only endpoint |
| `employee.list` | success | An administrator lists employees (count and whether a filter was used) |
| `employee.view` | success, denied | An administrator opens **someone else's** record, or anyone is refused another person's record. Reading your own record is not logged |
| `employee.create` | success, failure | An administrator creates an employee, or the email already exists |
| `audit.view` | success | An administrator reads the audit log |

What an entry holds: when, who (user id), what, the outcome, the record it concerned (type
and id), the caller's IP address and a few short details. It never holds passwords, tokens
or the email that was typed at sign-in, because people sometimes type a password into the
email box. A failed sign-in for an unknown email therefore has no actor, only the IP address.

**Append-only.** The database refuses `UPDATE`, `DELETE` and `TRUNCATE` on `audit_events`
(triggers in migration `0003`), and the API has no way to edit or remove an entry. This
stops application bugs and a stolen application login from rewriting history. It does not
stop a database superuser or the table owner, who can drop the triggers. Treat the log as
tamper-resistant, not tamper-proof.

`actor_user_id` and `entity_id` are plain values with no foreign key, so an entry outlives
the account or record it describes.

The IP address is the address that connected to the server. Behind a reverse proxy it would
be the proxy's address.

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
| GET | `/api/v1/audit` | Admin | Audit log, newest first. Optional `action`, `outcome`, `actorUserId`, `limit` (1 to 200), `offset` |

JSON uses camelCase (`startDate`, `accessToken`) to match `frontend/src/types/hr.ts`.

## Not built yet

Refresh tokens in httpOnly cookies, login rate limiting or lockout, password reset and token
revocation on logout. Until the refresh flow exists, users sign in again when the token
expires. The AI layer (policy assistant and leave agent) is planned and will use the same
audit trail.
