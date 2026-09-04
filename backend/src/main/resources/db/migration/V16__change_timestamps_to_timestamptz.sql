ALTER TABLE refresh_tokens
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'America/Mexico_City',
  ALTER COLUMN expires_at TYPE TIMESTAMPTZ
  USING expires_at AT TIME ZONE 'America/Mexico_City';

ALTER TABLE showtimes
  ALTER COLUMN start_time TYPE TIMESTAMPTZ
  USING start_time AT TIME ZONE 'America/Mexico_City',
  ALTER COLUMN end_time TYPE TIMESTAMPTZ
  USING end_time AT TIME ZONE 'America/Mexico_City';

ALTER TABLE reservations
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'America/Mexico_City',
  ALTER COLUMN reserve_until TYPE TIMESTAMPTZ
  USING reserve_until AT TIME ZONE 'America/Mexico_City';

ALTER TABLE payments
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'America/Mexico_City',
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ
  USING updated_at AT TIME ZONE 'America/Mexico_City';
