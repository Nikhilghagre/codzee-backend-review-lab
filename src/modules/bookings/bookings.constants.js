const BOOKING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
});

const BOOKING_STATUSES = Object.freeze(Object.values(BOOKING_STATUS));

module.exports = { BOOKING_STATUS, BOOKING_STATUSES };
