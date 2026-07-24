ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;

UPDATE users
SET username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'))
  || '_'
  || left(replace(id::text, '-', ''), 6)
WHERE username IS NULL OR trim(username) = '';

ALTER TABLE users ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_uq ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_number_uq
  ON users (phone_number)
  WHERE phone_number IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_format_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_username_format_check
      CHECK (username ~ '^[a-z0-9_][a-z0-9_.]{2,29}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_number_format_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_phone_number_format_check
      CHECK (phone_number IS NULL OR phone_number ~ '^\+?[0-9]{7,20}$');
  END IF;
END $$;
