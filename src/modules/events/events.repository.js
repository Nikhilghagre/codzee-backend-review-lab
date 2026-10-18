const { getDb } = require('../../db');

const ACTIVE_BOOKING = "b.status IN ('PENDING', 'CONFIRMED')";

function findAll() {
  return getDb()
    .prepare(
      `SELECT e.id, e.name, e.venue, e.city, e.starts_at,
              COUNT(s.id)               AS total_seats,
              COUNT(s.id) - COUNT(b.id) AS available_seats,
              MIN(s.price_paise)        AS min_price_paise
         FROM events e
         LEFT JOIN seats s    ON s.event_id = e.id
         LEFT JOIN bookings b ON b.seat_id = s.id AND ${ACTIVE_BOOKING}
        GROUP BY e.id
        ORDER BY e.starts_at`
    )
    .all();
}

function findById(id) {
  return getDb()
    .prepare('SELECT id, name, venue, city, starts_at FROM events WHERE id = ?')
    .get(id);
}

function findSeatsByEventId(eventId) {
  return getDb()
    .prepare(
      `SELECT s.id, s.seat_no, s.category, s.price_paise,
              CASE WHEN b.id IS NULL THEN 1 ELSE 0 END AS is_available
         FROM seats s
         LEFT JOIN bookings b ON b.seat_id = s.id AND ${ACTIVE_BOOKING}
        WHERE s.event_id = ?
        ORDER BY s.id`
    )
    .all(eventId);
}

function findSeatById(id) {
  return getDb()
    .prepare('SELECT id, event_id, seat_no, category, price_paise FROM seats WHERE id = ?')
    .get(id);
}

module.exports = { findAll, findById, findSeatsByEventId, findSeatById };
