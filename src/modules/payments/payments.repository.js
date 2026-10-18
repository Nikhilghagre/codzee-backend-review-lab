const { getDb } = require('../../db');
const { BOOKING_STATUS } = require('../bookings/bookings.constants');
const { PAYMENT_STATUS } = require('./payments.constants');

function findUserBookingWithPrice(bookingId, userId) {
  return getDb()
    .prepare(
      `SELECT b.id, b.user_id, b.status, s.seat_no, s.price_paise
         FROM bookings b
         JOIN seats s ON s.id = b.seat_id
        WHERE b.id = @bookingId AND b.user_id = @userId`
    )
    .get({ bookingId, userId });
}

function findById(id) {
  return getDb()
    .prepare(
      `SELECT p.id, p.user_id, p.amount_paise, p.currency, p.status, p.gateway_ref, p.created_at,
              b.id AS booking_id
         FROM payments p
         LEFT JOIN bookings b ON b.payment_id = p.id
        WHERE p.id = ?`
    )
    .get(id);
}

function insertFailedPayment({ userId, amountPaise }) {
  return getDb()
    .prepare('INSERT INTO payments (user_id, amount_paise, status) VALUES (@userId, @amountPaise, @status)')
    .run({ userId, amountPaise, status: PAYMENT_STATUS.FAILED });
}

function recordSuccessfulPayment({ bookingId, userId, amountPaise, gatewayRef }) {
  const db = getDb();

  const record = db.transaction(() => {
    const { lastInsertRowid: paymentId } = db
      .prepare(
        `INSERT INTO payments (user_id, amount_paise, status, gateway_ref)
         VALUES (@userId, @amountPaise, @status, @gatewayRef)`
      )
      .run({ userId, amountPaise, status: PAYMENT_STATUS.SUCCESS, gatewayRef });

    db.prepare('UPDATE bookings SET status = @status, payment_id = @paymentId WHERE id = @bookingId').run({
      status: BOOKING_STATUS.CONFIRMED,
      paymentId,
      bookingId,
    });

    return paymentId;
  });

  return findById(record());
}

module.exports = { findUserBookingWithPrice, findById, insertFailedPayment, recordSuccessfulPayment };
