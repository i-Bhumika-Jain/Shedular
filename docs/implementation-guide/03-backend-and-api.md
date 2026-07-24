# Backend and API Design

The current backend is an Express + PostgreSQL API living in:

```text
server/
```

It follows a simple professional structure:

```text
server/
  app.js
  index.js
  config/
  db/
    migrations/
  middleware/
  repositories/
  routes/
  services/
  utils/
  validators/
```

## Architecture Rules

- routes stay thin
- validation is handled with Zod schemas
- services hold business rules and permissions
- repositories hold SQL/database access
- middleware handles auth/errors
- all API responses use a consistent success/error shape

## Environment

Create `.env` from `.env.example`:

```text
DATABASE_URL=postgres://postgres:postgres@localhost:5432/schedular
JWT_SECRET=replace-this-with-a-long-random-secret
```

Run migrations:

```bash
npm run db:migrate
```

Start the API:

```bash
npm run server:dev
```

The API runs at:

```text
http://localhost:4000/api/v1
```

## Implemented Endpoints

### Health

- `GET /api/v1/health`

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Signup creates:

- a user
- a user profile
- one default `schedule_people` record for that user
- one default weekly schedule

Signup requires:

- `name`
- `username`
- `email`
- `password`

Optional:

- `phoneNumber`

Login uses:

- `identifier`: username, email, or phone number
- `password`

### People

These represent people whose schedules can be managed.

- `GET /api/v1/people`
- `POST /api/v1/people`
- `PATCH /api/v1/people/:personId`

### Schedules

- `GET /api/v1/people/:personId/schedules`
- `POST /api/v1/people/:personId/schedules`

### Schedule Items

- `GET /api/v1/schedules/:scheduleId/items`
- `POST /api/v1/schedules/:scheduleId/items`
- `PATCH /api/v1/schedule-items/:itemId`
- `DELETE /api/v1/schedule-items/:itemId`
- `POST /api/v1/schedule-items/:itemId/completions`

Useful filters:

- `?weekday=1&completionDate=2026-05-26` for a weekly template day with completion state
- `?date=2026-05-26` for date-specific items

## Example Requests

### Signup

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "Bhumika Jain",
  "username": "bhumika_jain",
  "email": "bhumika@example.com",
  "phoneNumber": "+919876543210",
  "password": "password123",
  "timezone": "Asia/Kolkata"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "bhumika_jain",
  "password": "password123"
}
```

Use the returned token:

```http
Authorization: Bearer <token>
```

### Add Another Person

```http
POST /api/v1/people
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Mom",
  "relationship": "family",
  "timezone": "Asia/Kolkata"
}
```

### Add a Weekly Schedule Item

`weekday` uses `0 = Sunday`, `1 = Monday`, ... `6 = Saturday`.

```http
POST /api/v1/schedules/<scheduleId>/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Morning walk",
  "category": "health",
  "weekday": 1,
  "startTime": "06:30",
  "endTime": "07:00",
  "priority": 3
}
```

### Add a Date-Specific Schedule Item

```http
POST /api/v1/schedules/<scheduleId>/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Doctor appointment",
  "category": "selfcare",
  "scheduledDate": "2026-05-26",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

### Mark an Item Done

```http
POST /api/v1/schedule-items/<itemId>/completions
Authorization: Bearer <token>
Content-Type: application/json

{
  "completionDate": "2026-05-26",
  "status": "done"
}
```

## Response Shape

Success:

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload.",
    "details": []
  }
}
```

## Next Backend APIs

The schema is ready for these next:

- goals
- notes
- wellness logs
- period tracker
- saved links
- AI assistant message history
- sharing invites for `person_members`

## Current Frontend Data Flow

The app started as a prototype, so old data still exists in:

```text
src/data.js
browser localStorage
```

The new flow is:

1. User signs up or logs in through the backend.
2. Backend returns a JWT token.
3. Frontend loads the user's first planner person.
4. Frontend loads that person's weekly schedule from PostgreSQL.
5. If the database schedule is empty, the frontend seeds the old prototype schedule once.
6. Completing a timetable item is saved through the backend.

Goals, notes, saved links, wellness, and AI chat history still need their API wiring next.

## PostgreSQL Permission Fix

The app database user must be allowed to create tables in the `public` schema. Run this as a Postgres admin user:

```sql
ALTER DATABASE timetable OWNER TO "Bhumika";
GRANT ALL PRIVILEGES ON DATABASE timetable TO "Bhumika";
GRANT USAGE, CREATE ON SCHEMA public TO "Bhumika";
ALTER SCHEMA public OWNER TO "Bhumika";
```
