CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (position('@' IN email) > 1),
  password_hash TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_lower_uq ON users (lower(email));

CREATE TRIGGER users_touch_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  default_view TEXT NOT NULL DEFAULT 'dashboard',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER user_profiles_touch_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE schedule_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 120),
  relationship TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX schedule_people_owner_name_uq
  ON schedule_people(owner_user_id, lower(display_name))
  WHERE deleted_at IS NULL;

CREATE INDEX schedule_people_owner_idx ON schedule_people(owner_user_id);

CREATE TRIGGER schedule_people_touch_updated_at
BEFORE UPDATE ON schedule_people
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE person_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, user_id)
);

CREATE INDEX person_members_user_idx ON person_members(user_id);
CREATE INDEX person_members_person_role_idx ON person_members(person_id, role);

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Weekly Schedule',
  schedule_type TEXT NOT NULL DEFAULT 'weekly_template'
    CHECK (schedule_type IN ('weekly_template', 'dated_plan')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT schedules_date_range_check CHECK (
    start_date IS NULL OR end_date IS NULL OR end_date >= start_date
  )
);

CREATE INDEX schedules_person_idx ON schedules(person_id);
CREATE INDEX schedules_person_type_idx ON schedules(person_id, schedule_type)
  WHERE deleted_at IS NULL;

CREATE TRIGGER schedules_touch_updated_at
BEFORE UPDATE ON schedules
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 240),
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  weekday SMALLINT CHECK (weekday BETWEEN 0 AND 6),
  scheduled_date DATE,
  start_time TIME NOT NULL,
  end_time TIME,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  recurrence_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'assistant', 'system', 'import')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT schedule_items_scope_check CHECK (
    (weekday IS NOT NULL AND scheduled_date IS NULL)
    OR (weekday IS NULL AND scheduled_date IS NOT NULL)
  ),
  CONSTRAINT schedule_items_time_check CHECK (
    end_time IS NULL OR end_time > start_time
  )
);

CREATE INDEX schedule_items_weekday_idx
  ON schedule_items(schedule_id, weekday, start_time)
  WHERE deleted_at IS NULL;

CREATE INDEX schedule_items_date_idx
  ON schedule_items(schedule_id, scheduled_date, start_time)
  WHERE deleted_at IS NULL;

CREATE INDEX schedule_items_recurrence_gin_idx
  ON schedule_items USING GIN (recurrence_rule);

CREATE TRIGGER schedule_items_touch_updated_at
BEFORE UPDATE ON schedule_items
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_item_id UUID NOT NULL REFERENCES schedule_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  completion_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'done' CHECK (status IN ('done', 'skipped', 'moved')),
  note TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (schedule_item_id, completion_date)
);

CREATE INDEX task_completions_date_idx ON task_completions(completion_date);
