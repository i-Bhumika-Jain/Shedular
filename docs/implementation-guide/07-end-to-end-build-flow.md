# End-to-End Build Flow

This is the working order for completing Schedular as a real web app with a clean PostgreSQL backend.

## Product Flow

1. A user signs up with name, username, email, optional international phone number, password, and timezone.
2. Signup creates the user, profile, self planner person, membership, and default weekly schedule in one transaction.
3. The user logs in with username, email, or phone number and receives a JWT.
4. The dashboard loads the planner people available to that user through `person_members`.
5. The user selects a person and works inside that person's schedules, tasks, goals, notes, logs, links, and AI sessions.
6. Weekly schedule items use `weekday`; date-specific items use `scheduled_date`.
7. Daily completion state lives in `task_completions`, separate from reusable schedule templates.
8. Sharing is handled through `person_members` roles instead of duplicating ownership columns everywhere.

## Database Modules

- `users` and `user_profiles`: authentication and preferences.
- `schedule_people` and `person_members`: real-world planner subjects and access control.
- `schedules`, `schedule_items`, and `task_completions`: timetable foundation.
- `goals` and `goal_items`: goal tracking and checklist progress.
- `note_categories` and `notes`: structured notes.
- `wellness_logs`: daily mood, energy, sleep, water, weight, and notes.
- `period_settings` and `period_cycles`: optional period tracking configuration and history.
- `saved_links`: saved resources for workouts, study, skincare, cooking, or general use.
- `ai_sessions` and `ai_messages`: assistant chat history tied to a planner person.
- `audit_logs`: important backend actions for debugging and future admin/history views.

## Build Order

1. Stabilize schema and migrations.
2. Finish auth UX, including international phone country-code selection.
3. Complete people and schedule CRUD.
4. Build goals APIs and frontend views.
5. Build notes APIs and frontend views.
6. Build wellness and period tracker APIs and views.
7. Add saved links APIs and views.
8. Add AI assistant APIs after planner data is stable.
9. Add loading states, empty states, validation messages, and mobile polish.
10. Run migrations, backend checks, frontend build, and manual browser testing.
11. Deploy backend, database, and frontend with production environment variables.

## API Order

Build each module in the same pattern:

1. Pydantic request schema.
2. Route file.
3. Permission check through `person_members`.
4. SQL query with constraints and indexes already supporting the common filters.
5. Frontend service file.
6. Feature component/page.
7. Focused manual test in the browser.

## Current Next Step

The next backend milestone is to wire CRUD APIs for `goals`, then `notes`, because those tables are simple, visible on the dashboard, and validate the full end-to-end pattern before adding wellness, period tracking, links, and AI.
