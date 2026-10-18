const { MAX_SEATS_PER_BOOKING } = require('./bookings.constants');
const { BadRequestError } = require('../../common/errors/AppError');
const { parseId } = require('../../common/utils/validate');

function parseCreateBookingBody(body) {
  if (!body || typeof body !== 'object') {
    throw new BadRequestError('Request body is required');
  }

  const { event_id: eventId, seat_ids: seatIds, user_id: onBehalfOfUserId } = body;

  if (eventId === undefined) {
    throw new BadRequestError('event_id is required');
  }
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    throw new BadRequestError('seat_ids must be a non-empty array');
  }
  if (seatIds.length > MAX_SEATS_PER_BOOKING) {
    throw new BadRequestError(`A maximum of ${MAX_SEATS_PER_BOOKING} seats can be booked at once`);
  }

  return {
    eventId: parseId(eventId, 'event_id'),
    seatIds: seatIds.map((id) => parseId(id, 'seat_ids')),
    onBehalfOfUserId: onBehalfOfUserId === undefined ? undefined : parseId(onBehalfOfUserId, 'user_id'),
  };
}

module.exports = { parseCreateBookingBody };
