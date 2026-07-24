CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  target_date DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE goals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'custom';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 3;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS goals_person_status_idx
  ON goals(person_id, status, target_date)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS goals_touch_updated_at ON goals;

CREATE TRIGGER goals_touch_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS goal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  is_done BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE goal_items ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'goal_items'
      AND column_name = 'position'
  ) THEN
    EXECUTE 'UPDATE goal_items SET sort_order = position WHERE sort_order = 0';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS goal_items_goal_sort_idx ON goal_items(goal_id, sort_order, created_at);

DROP TRIGGER IF EXISTS goal_items_touch_updated_at ON goal_items;

CREATE TRIGGER goal_items_touch_updated_at
BEFORE UPDATE ON goal_items
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS note_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80),
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE note_categories ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE note_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE note_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS note_categories_person_name_uq
  ON note_categories(person_id, lower(name))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS note_categories_person_sort_idx
  ON note_categories(person_id, sort_order)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS note_categories_touch_updated_at ON note_categories;

CREATE TRIGGER note_categories_touch_updated_at
BEFORE UPDATE ON note_categories
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  category_id UUID REFERENCES note_categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  body TEXT NOT NULL DEFAULT '',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES schedule_people(id) ON DELETE CASCADE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notes'
      AND column_name = 'content'
  ) THEN
    EXECUTE 'UPDATE notes SET body = content WHERE body = ''''';
  END IF;
END $$;

UPDATE notes
SET person_id = note_categories.person_id
FROM note_categories
WHERE notes.category_id = note_categories.id
  AND notes.person_id IS NULL;

ALTER TABLE notes ALTER COLUMN category_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notes WHERE person_id IS NULL) THEN
    ALTER TABLE notes ALTER COLUMN person_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS notes_person_updated_idx
  ON notes(person_id, is_pinned DESC, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS notes_category_idx
  ON notes(category_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS notes_touch_updated_at ON notes;

CREATE TRIGGER notes_touch_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS wellness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  mood_score SMALLINT CHECK (mood_score BETWEEN 1 AND 10),
  energy_score SMALLINT CHECK (energy_score BETWEEN 1 AND 10),
  sleep_minutes INTEGER CHECK (sleep_minutes IS NULL OR sleep_minutes >= 0),
  water_glasses SMALLINT CHECK (water_glasses IS NULL OR water_glasses >= 0),
  weight_kg NUMERIC(5, 2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, log_date)
);

ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS mood_score SMALLINT;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS energy_score SMALLINT;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS sleep_minutes INTEGER;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS water_glasses SMALLINT;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5, 2);
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'wellness_logs'
      AND column_name = 'energy'
  ) THEN
    EXECUTE 'UPDATE wellness_logs SET energy_score = energy WHERE energy_score IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'wellness_logs'
      AND column_name = 'note'
  ) THEN
    EXECUTE 'UPDATE wellness_logs SET notes = note WHERE notes IS NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS wellness_logs_person_date_idx ON wellness_logs(person_id, log_date DESC);

DROP TRIGGER IF EXISTS wellness_logs_touch_updated_at ON wellness_logs;

CREATE TRIGGER wellness_logs_touch_updated_at
BEFORE UPDATE ON wellness_logs
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS period_settings (
  person_id UUID PRIMARY KEY REFERENCES schedule_people(id) ON DELETE CASCADE,
  tracking_enabled BOOLEAN NOT NULL DEFAULT true,
  cycle_length_days SMALLINT NOT NULL DEFAULT 28 CHECK (cycle_length_days BETWEEN 15 AND 60),
  period_length_days SMALLINT NOT NULL DEFAULT 5 CHECK (period_length_days BETWEEN 1 AND 15),
  last_period_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE period_settings ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE period_settings ADD COLUMN IF NOT EXISTS cycle_length_days SMALLINT NOT NULL DEFAULT 28;
ALTER TABLE period_settings ADD COLUMN IF NOT EXISTS period_length_days SMALLINT NOT NULL DEFAULT 5;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'period_settings'
      AND column_name = 'cycle_length'
  ) THEN
    EXECUTE 'UPDATE period_settings SET cycle_length_days = cycle_length';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'period_settings'
      AND column_name = 'period_duration'
  ) THEN
    EXECUTE 'UPDATE period_settings SET period_length_days = period_duration';
  END IF;
END $$;

DROP TRIGGER IF EXISTS period_settings_touch_updated_at ON period_settings;

CREATE TRIGGER period_settings_touch_updated_at
BEFORE UPDATE ON period_settings
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS period_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow_intensity TEXT CHECK (
    flow_intensity IS NULL OR flow_intensity IN ('spotting', 'light', 'moderate', 'heavy')
  ),
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  is_predicted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT period_cycles_date_range_check CHECK (
    end_date IS NULL OR end_date >= start_date
  )
);

ALTER TABLE period_cycles ADD COLUMN IF NOT EXISTS flow_intensity TEXT;
ALTER TABLE period_cycles ADD COLUMN IF NOT EXISTS symptoms TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE period_cycles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE period_cycles ADD COLUMN IF NOT EXISTS is_predicted BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'period_cycles'
      AND column_name = 'note'
  ) THEN
    EXECUTE 'UPDATE period_cycles SET notes = note WHERE notes IS NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS period_cycles_person_date_idx ON period_cycles(person_id, start_date DESC);

DROP TRIGGER IF EXISTS period_cycles_touch_updated_at ON period_cycles;

CREATE TRIGGER period_cycles_touch_updated_at
BEFORE UPDATE ON period_cycles
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS saved_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  url TEXT NOT NULL CHECK (url ~* '^https?://'),
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE saved_links ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE saved_links ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE saved_links ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE saved_links ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE saved_links ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'saved_links'
      AND column_name = 'link_type'
  ) THEN
    EXECUTE 'UPDATE saved_links SET category = link_type WHERE category = ''general''';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS saved_links_person_category_idx
  ON saved_links(person_id, category, updated_at DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS saved_links_touch_updated_at ON saved_links;

CREATE TRIGGER saved_links_touch_updated_at
BEFORE UPDATE ON saved_links
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES schedule_people(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New chat' CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  model TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

UPDATE ai_sessions SET title = 'New chat' WHERE title IS NULL OR trim(title) = '';

ALTER TABLE ai_sessions ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE ai_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE ai_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE ai_sessions ALTER COLUMN title SET NOT NULL;

CREATE INDEX IF NOT EXISTS ai_sessions_person_updated_idx
  ON ai_sessions(person_id, updated_at DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS ai_sessions_touch_updated_at ON ai_sessions;

CREATE TRIGGER ai_sessions_touch_updated_at
BEFORE UPDATE ON ai_sessions
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ai_messages'
      AND column_name = 'message'
  ) THEN
    EXECUTE 'UPDATE ai_messages SET content = message WHERE content = ''''';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ai_messages_session_created_idx ON ai_messages(session_id, created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL CHECK (char_length(trim(entity_type)) BETWEEN 1 AND 80),
  entity_id UUID,
  action TEXT NOT NULL CHECK (char_length(trim(action)) BETWEEN 1 AND 80),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS audit_logs_actor_created_idx ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id, created_at DESC);
