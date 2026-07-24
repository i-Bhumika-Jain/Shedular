CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'phone')),
  destination TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts SMALLINT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_otps_user_active_idx
  ON password_reset_otps(user_id, created_at DESC)
  WHERE consumed_at IS NULL;

CREATE INDEX IF NOT EXISTS password_reset_otps_expires_idx
  ON password_reset_otps(expires_at)
  WHERE consumed_at IS NULL;
