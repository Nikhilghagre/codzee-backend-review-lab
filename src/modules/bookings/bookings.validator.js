const { BOOKING_STATUSES } = require('./bookings.constants');
const { BadRequestError } = require('../../common/errors/AppError');

function parseBookingStatus(value) {
  if (value === undefined || value === '') return undefined;

  const status = String(value).trim().toUpperCase();
  if (!BOOKING_STATUSES.includes(status)) {
    throw new BadRequestError(`status must be one of ${BOOKING_STATUSES.join(', ')}`);
  }
  return status;
}

module.exports = { parseBookingStatus };
