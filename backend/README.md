# HRIS backend

FastAPI + SQLAlchemy + PostgreSQL. Run every command below from the `backend/` folder.

## Setup

1. Create the database, for example `CREATE DATABASE hris;`.
2. Copy `.env.example` to `.env` and put your real password in `DATABASE_URL`.
   Keep the `postgresql+psycopg://` prefix. `.env` is git-ignored: never commit it.
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

## Run

```powershell
uvicorn app.main:app --reload
```

Interactive docs: http://127.0.0.1:8000/docs

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/health` | Service check, no database |
| GET | `/api/v1/health/db` | Checks the PostgreSQL connection |
| GET | `/api/v1/employees` | List employees. Optional `search`, `department`, `status` |
| GET | `/api/v1/employees/{id}` | One employee |
| POST | `/api/v1/employees` | Create an employee (409 if the email exists) |

JSON uses camelCase (`startDate`) to match `frontend/src/types/hr.ts`.
