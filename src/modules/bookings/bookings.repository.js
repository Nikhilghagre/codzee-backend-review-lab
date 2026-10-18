const { getDb } = require('../../db');
const { inList, placeholders } = require('../../common/utils/sql');
const { BOOKING_STATUS, SEAT_HOLDING_STATUSES } = require('./bookings.constants');

function findEventSeats(eventId, seatIds) {
  return getDb()
    .prepare(
      `SELECT s.id, s.event_id, s.seat_no, s.category, s.price_paise,
              EXISTS (
                SELECT 1 FROM bookings b
                 WHERE b.seat_id = s.id AND ${inList('b.status', SEAT_HOLDING_STATUSES)}
              ) AS is_booked
         FROM seats s
        WHERE s.event_id = ? AND s.id IN (${placeholders(seatIds.length)})`
    )
    .all(eventId, ...seatIds);
}

function createPendingBookings({ userId, seats }) {
  const db = getDb();
  const insert = db.prepare('INSERT INTO bookings (user_id, seat_id, status) VALUES (?, ?, ?)');
  const findById = db.prepare('SELECT id, user_id, seat_id, status, created_at FROM bookings WHERE id = ?');

  const create = db.transaction(() =>
    seats.map((seat) => {
      const { lastInsertRowid } = insert.run(userId, seat.id, BOOKING_STATUS.PENDING);
      return findById.get(lastInsertRowid);
    })
  );

  return create();
}

module.exports = { findEventSeats, createPendingBookings };
