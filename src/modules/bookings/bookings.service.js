const bookingsRepository = require('./bookings.repository');
const eventsRepository = require('../events/events.repository');
const { toBookingDetails } = require('./bookings.mapper');
const { BOOKING_STATUS } = require('./bookings.constants');
const { toMoney } = require('../../common/utils/money');

function getUserBookings(userId, { status } = {}) {
  const bookings = bookingsRepository.findByUserId(userId, { status });

  const items = bookings.map((booking) => {
    const seat = eventsRepository.findSeatById(booking.seat_id);
    const event = eventsRepository.findById(seat.event_id);
    return toBookingDetails({ booking, seat, event });
  });

  const totalSpentPaise = items
    .filter((item) => item.status === BOOKING_STATUS.CONFIRMED)
    .reduce((sum, item) => sum + item.seat.price.amount_paise, 0);

  return {
    items,
    summary: {
      total_bookings: items.length,
      total_spent: toMoney(totalSpentPaise),
    },
  };
}

module.exports = { getUserBookings };
