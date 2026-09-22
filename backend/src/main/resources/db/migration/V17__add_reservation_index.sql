DROP INDEX IF EXISTS idx_reservations_date_status;

CREATE INDEX idx_reservations_status_reserved_until
ON reservations(status, reserve_until);
