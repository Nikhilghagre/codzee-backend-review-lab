const bookingsRepository = require('./bookings.repository');
const eventsRepository = require('../events/events.repository');
const usersRepository = require('../users/users.repository');
const pricingService = require('../../integrations/pricingService');
const { toBookingConfirmation } = require('./bookings.mapper');
const { BadRequestError, ConflictError, NotFoundError } = require('../../common/errors/AppError');

async function bookSeats({ userId, eventId, seatIds }) {
  if (!usersRepository.findById(userId)) {
    throw new NotFoundError(`User ${userId} not found`);
  }

  const event = eventsRepository.findById(eventId);
  if (!event) {
    throw new NotFoundError(`Event ${eventId} not found`);
  }

  const seatsById = new Map(bookingsRepository.findEventSeats(eventId, seatIds).map((seat) => [seat.id, seat]));

  const missingSeatIds = seatIds.filter((id) => !seatsById.has(id));
  if (missingSeatIds.length > 0) {
    throw new BadRequestError(`Seats ${missingSeatIds.join(', ')} do not belong to event ${eventId}`);
  }

  const requestedSeats = seatIds.map((id) => seatsById.get(id));

  const unavailableSeats = requestedSeats.filter((seat) => seat.is_booked);
  if (unavailableSeats.length > 0) {
    throw new ConflictError(`Seats ${unavailableSeats.map((seat) => seat.seat_no).join(', ')} are already booked`);
  }

  const quote = await pricingService.getQuote({ eventId, seats: requestedSeats });

  const bookings = bookingsRepository.createPendingBookings({ userId, seats: requestedSeats });

  return toBookingConfirmation({ event, seats: requestedSeats, bookings, quote });
}

module.exports = { bookSeats };
