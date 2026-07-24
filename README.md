# Schedular

A personal timetable and schedule planner with a Python backend and a Next.js frontend.

## Stack

- Backend: FastAPI, PostgreSQL, psycopg, JWT auth
- Frontend: Next.js, React
- Database: PostgreSQL database named `timetable`

## Run

Install backend dependencies:

```cmd
npm run backend:install
```

Run database migrations:

```cmd
npm run backend:migrate
```

Start the backend API:

```cmd
npm run backend:dev
```

Start the frontend:

```cmd
npm run frontend:dev
```

Useful URLs:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:8000/api/v1`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

## File Purposes

- `backend/` - Python FastAPI backend.
- `backend/app/main.py` - FastAPI app entrypoint, CORS setup, route registration.
- `backend/app/api/routes/` - API endpoints for auth, people, and schedules.
- `backend/app/api/deps.py` - Shared API dependencies, including current-user auth.
- `backend/app/schemas/` - Pydantic request and response validation models.
- `backend/app/security/auth.py` - Password hashing, JWT creation, token verification.
- `backend/app/db/` - PostgreSQL connection pool and migration runner.
- `backend/migrations/` - SQL migration files that create/update database tables.
- `backend/.env.example` - Backend environment variable template.
- `frontend-next/` - Next.js frontend application.
- `frontend-next/src/app/` - Next.js route pages and global layout/styles.
- `frontend-next/src/features/auth/` - Login/signup UI and auth API calls.
- `frontend-next/src/features/dashboard/` - Timetable dashboard UI and schedule API calls.
- `frontend-next/src/lib/api.js` - Shared frontend API client and token storage helpers.
- `frontend-next/.env.example` - Frontend environment variable template.
- `docs/` - Planning and architecture reference docs.
- `pdf_text.txt` - Extracted reference text from the original planner PDF.
- `Personal_Weekly_Plan_WeightLoss_SkinCare_v2.pdf` - Original planner reference PDF.
- `package.json` - Root convenience scripts for backend/frontend commands.
- `.gitignore` - Keeps secrets, logs, dependency folders, and generated caches out of git.

## Notes

Runtime config is intentionally local:

- Backend secrets live in `backend/.env`.
- Frontend API URL lives in `frontend-next/.env.local`.

These files are ignored by git so passwords and local machine settings do not get committed.
