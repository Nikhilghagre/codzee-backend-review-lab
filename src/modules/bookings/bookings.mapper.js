const { toMoney } = require('../../common/utils/money');

function toBookingDetails({ booking, seat, event }) {
  return {
    id: booking.id,
    status: booking.status,
    booked_at: booking.created_at,
    event: {
      id: event.id,
      name: event.name,
      venue: event.venue,
      city: event.city,
      starts_at: event.starts_at,
    },
    seat: {
      id: seat.id,
      seat_no: seat.seat_no,
      category: seat.category,
      price: toMoney(seat.price_paise),
    },
  };
}

module.exports = { toBookingDetails };
