const bookingsService = require('./bookings.service');
const { parseCreateBookingBody } = require('./bookings.validator');

async function createBooking(req, res) {
  const { eventId, seatIds, onBehalfOfUserId } = parseCreateBookingBody(req.body);

  const booking = await bookingsService.bookSeats({
    userId: onBehalfOfUserId ?? req.user.id,
    eventId,
    seatIds,
  });

  res.status(201).json({ data: booking });
}

module.exports = { createBooking };
