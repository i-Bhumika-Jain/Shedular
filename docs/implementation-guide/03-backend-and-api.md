# Backend and API Design

## Recommended Backend Approach

For MVP, use `Next.js` with route handlers.

That gives:

- one repo
- easier deployment
- faster shipping
- server-side AI calls
- protected APIs

If the product grows heavily later, we can split backend into a separate service.

## Core Backend Responsibilities

- authentication and authorization
- CRUD for planner data
- recurring task generation
- AI prompt orchestration
- reminders and notifications
- audit logs and analytics

## API Design Principles

- version your APIs from day one
- keep endpoints resource-based
- validate every request
- never call AI directly from the browser with secret keys
- put business logic in services, not inside route files

## Example API Structure

```text
/api/v1/auth/*
/api/v1/profile
/api/v1/schedules
/api/v1/tasks
/api/v1/goals
/api/v1/notes
/api/v1/checklists
/api/v1/wellness/mood
/api/v1/wellness/energy
/api/v1/wellness/period
/api/v1/ai/assistant
/api/v1/ai/schedule-suggestions
```

## Example Endpoints

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`

### Planner

- `GET /api/v1/tasks?date=2026-03-27`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:taskId`
- `DELETE /api/v1/tasks/:taskId`

### Goals

- `GET /api/v1/goals`
- `POST /api/v1/goals`
- `PATCH /api/v1/goals/:goalId`

### Wellness

- `POST /api/v1/wellness/mood`
- `POST /api/v1/wellness/energy`
- `GET /api/v1/wellness/period`
- `POST /api/v1/wellness/period/log`

### AI

- `POST /api/v1/ai/assistant`
- `POST /api/v1/ai/schedule-suggestions`

## Service Layer Suggestion

```text
src/
  server/
    services/
      auth.service.ts
      planner.service.ts
      goals.service.ts
      notes.service.ts
      wellness.service.ts
      ai.service.ts
    repositories/
      task.repository.ts
      goal.repository.ts
      note.repository.ts
```

## API Response Shape

Use a consistent contract:

```json
{
  "success": true,
  "data": {},
  "message": "Task created successfully"
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload"
  }
}
```
