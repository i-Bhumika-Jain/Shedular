# Database Design

## Why PostgreSQL

`PostgreSQL` is a strong choice for this app because:

- relational data fits naturally
- strong indexing support
- JSON support for flexible AI metadata
- great with Prisma
- scalable enough for MVP and beyond

## Core Tables

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `timezone`
- `created_at`
- `updated_at`

### `profiles`

- `id`
- `user_id`
- `theme`
- `default_view`
- `onboarding_complete`

### `tasks`

- `id`
- `user_id`
- `date`
- `title`
- `description`
- `category`
- `status`
- `priority`
- `start_time`
- `end_time`
- `is_recurring`
- `recurrence_rule`
- `source`
- `created_at`
- `updated_at`

### `goals`

- `id`
- `user_id`
- `title`
- `icon`
- `color`
- `created_at`

### `goal_items`

- `id`
- `goal_id`
- `title`
- `is_done`
- `position`

### `notes`

- `id`
- `user_id`
- `category`
- `title`
- `content`
- `created_at`
- `updated_at`

### `mood_logs`

- `id`
- `user_id`
- `date`
- `mood`
- `energy`
- `note`

### `period_logs`

- `id`
- `user_id`
- `start_date`
- `cycle_length`
- `period_duration`

### `ai_conversations`

- `id`
- `user_id`
- `session_id`
- `role`
- `message`
- `metadata_json`
- `created_at`

### `saved_links`

- `id`
- `user_id`
- `type`
- `title`
- `url`

## Important Rules

- every user-owned table must include `user_id`
- add indexes on `user_id`, `date`, and commonly filtered columns
- use soft delete only where business value exists
- store timestamps on all important tables

## Example Relationships

- one user has many tasks
- one user has many goals
- one goal has many goal items
- one user has many notes
- one user has many mood logs
- one user has many period logs
- one user has many AI messages

## Suggested Future Additions

- reminders
- notifications
- device sessions
- activity logs
- shared planners
