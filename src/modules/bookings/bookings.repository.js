const { getDb } = require('../../db');

function findByUserId(userId, { status = null } = {}) {
  return getDb()
    .prepare(
      `SELECT id, user_id, seat_id, payment_id, status, created_at
         FROM bookings
        WHERE user_id = @userId
          AND (@status IS NULL OR status = @status)
        ORDER BY created_at DESC, id DESC`
    )
    .all({ userId, status });
}

module.exports = { findByUserId };
