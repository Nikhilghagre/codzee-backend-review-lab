-- All money columns are stored in paise (1 INR = 100 paise) as INTEGER.

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  phone       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  venue       TEXT    NOT NULL,
  city        TEXT    NOT NULL,
  starts_at   TEXT    NOT NULL, -- ISO 8601 with IST offset, e.g. 2026-12-20T19:00:00+05:30
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS seats (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id     INTEGER NOT NULL REFERENCES events(id),
  seat_no      TEXT    NOT NULL,
  category     TEXT    NOT NULL CHECK (category IN ('PLATINUM', 'GOLD', 'SILVER')),
  price_paise  INTEGER NOT NULL CHECK (price_paise > 0),
  UNIQUE (event_id, seat_no)
);

CREATE TABLE IF NOT EXISTS payments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  amount_paise  INTEGER NOT NULL CHECK (amount_paise > 0),
  currency      TEXT    NOT NULL DEFAULT 'INR',
  status        TEXT    NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  gateway_ref   TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  seat_id     INTEGER NOT NULL REFERENCES seats(id),
  payment_id  INTEGER REFERENCES payments(id),
  status      TEXT    NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_seats_event_id    ON seats(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id  ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seat_id  ON bookings(seat_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id  ON payments(user_id);
