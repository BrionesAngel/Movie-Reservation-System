CREATE TABLE showtime_seats (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status VARCHAR(15) NOT NULL,
  showtime_id BIGINT NOT NULL REFERENCES showtimes(id),
  seat_id BIGINT NOT NULL REFERENCES seats(id),
  reservation_id BIGINT REFERENCES reservations(id)
);
