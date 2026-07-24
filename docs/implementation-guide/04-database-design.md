# Database Design

This project now has a first PostgreSQL schema in:

```text
server/db/migrations/001_initial_schema.sql
```

The design is multi-user and multi-person. That means:

- many users can sign up and log in
- one user can manage schedules for more than one person
- schedules can later be shared with another user as `owner`, `editor`, or `viewer`
- weekly templates and date-specific plans are both supported

## Core Relationship Model

```text
users
  -> user_profiles
  -> person_members
      -> schedule_people
          -> schedules
              -> schedule_items
                  -> task_completions
          -> goals
              -> goal_items
          -> note_categories
              -> notes
          -> wellness_logs
          -> period_settings
          -> period_cycles
          -> saved_links
          -> ai_sessions
              -> ai_messages
```

## Tables

### `users`

Stores real login accounts.

Important columns:

- `id UUID PRIMARY KEY`
- `name`
- `email`
- `password_hash`
- `timezone`
- `status`
- `created_at`
- `updated_at`

Rules:

- emails are stored lowercase
- unique index is on `lower(email)`
- never store plain passwords

### `user_profiles`

Stores UI/user preferences that do not belong in auth.

Important columns:

- `user_id`
- `theme`
- `default_view`
- `onboarding_complete`

### `schedule_people`

Represents the person whose schedule is being managed.

This is the key table for "make schedules for several people."

Examples:

- your own planner
- family member
- student
- client
- team member

Important columns:

- `id`
- `owner_user_id`
- `display_name`
- `relationship`
- `timezone`
- `deleted_at`

### `person_members`

Controls who can access a person's planner.

Important columns:

- `person_id`
- `user_id`
- `role`: `owner`, `editor`, `viewer`

This avoids hardcoding ownership into every query and lets us add sharing later.

### `schedules`

Stores a schedule container.

Important columns:

- `person_id`
- `name`
- `schedule_type`: `weekly_template` or `dated_plan`
- `start_date`
- `end_date`
- `is_active`

### `schedule_items`

Stores individual tasks/events inside a schedule.

Important columns:

- `schedule_id`
- `title`
- `description`
- `category`
- `priority`
- `weekday`
- `scheduled_date`
- `start_time`
- `end_time`
- `recurrence_rule JSONB`
- `source`: `manual`, `assistant`, `system`, `import`

Rules:

- weekly template items use `weekday`
- date-specific items use `scheduled_date`
- the schema enforces exactly one of those fields

### `task_completions`

Stores daily completion state separately from template tasks.

This is important because a Monday template task can be completed on one Monday but still exist for future Mondays.

Important columns:

- `schedule_item_id`
- `completion_date`
- `status`: `done`, `skipped`, `moved`
- `completed_at`

### `goals` and `goal_items`

Stores goal categories and checklist items.

### `note_categories` and `notes`

Stores notes without forcing all notes into one giant JSON object.

### `wellness_logs`

Stores daily mood, energy, and notes.

### `period_settings` and `period_cycles`

Stores period tracking configuration and history.

### `saved_links`

Stores workout, study, skincare, cooking, or general resource links.

### `ai_sessions` and `ai_messages`

Stores assistant conversations safely on the backend.

### `audit_logs`

Stores important system actions for debugging and future admin/history views.

## Indexing Strategy

Indexes are included for:

- user email lookup
- person membership lookup
- person schedules
- schedule items by weekday/date/time
- completion date
- notes/goals by parent
- audit logs by actor and entity

## Delete Strategy

- `users` cascade to owned private data
- planner people, schedules, tasks, goals, and notes support soft delete where user-facing recovery/history may matter
- child-only records like `goal_items` can cascade because they do not make sense without their parent
