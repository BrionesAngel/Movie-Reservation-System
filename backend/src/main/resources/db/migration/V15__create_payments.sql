CREATE TABLE payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id BIGINT NOT NULL UNIQUE REFERENCES reservations(id),
  stripe_payment_intent_id VARCHAR(50) NOT NULL UNIQUE,
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(15) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
