CREATE TABLE showtimes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  movie_id BIGINT NOT NULL REFERENCES movies(id),
  room_id BIGINT NOT NULL REFERENCES rooms(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  price DECIMAL(5,2) NOT NULL
);

CREATE INDEX idx_showtime_room_time ON showtimes (room_id, start_time, end_time);
