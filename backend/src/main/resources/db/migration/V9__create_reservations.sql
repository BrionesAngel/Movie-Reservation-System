CREATE TABLE reservations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  showtime_id BIGINT NOT NULL REFERENCES showtimes(id),
  created_at TIMESTAMP NOT NULL,
  status VARCHAR(15) NOT NULL,
  total_price DECIMAL(8,2)
);
