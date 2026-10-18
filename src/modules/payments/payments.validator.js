const { BadRequestError } = require('../../common/errors/AppError');
const { parseId } = require('../../common/utils/validate');

function parseCreatePaymentBody(body) {
  if (!body || typeof body !== 'object') {
    throw new BadRequestError('Request body is required');
  }
  if (body.booking_id === undefined) {
    throw new BadRequestError('booking_id is required');
  }

  return { bookingId: parseId(body.booking_id, 'booking_id') };
}

module.exports = { parseCreatePaymentBody };
