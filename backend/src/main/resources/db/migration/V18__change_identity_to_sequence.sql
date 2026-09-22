CREATE SEQUENCE showtime_seats_seq INCREMENT 50;
SELECT setval('showtime_seats_seq', COALESCE((SELECT MAX(id) FROM showtime_seats), 1));
ALTER TABLE showtime_seats ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE showtime_seats ALTER COLUMN id SET DEFAULT nextval('showtime_seats_seq');
