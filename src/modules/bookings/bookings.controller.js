const bookingsService = require('./bookings.service');
const { parseBookingStatus } = require('./bookings.validator');

function getMyBookings(req, res) {
  const status = parseBookingStatus(req.query.status);
  const bookings = bookingsService.getUserBookings(req.user.id, { status });

  res.json({ data: bookings });
}

module.exports = { getMyBookings };
