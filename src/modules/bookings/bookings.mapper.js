const { toMoney } = require('../../common/utils/money');

function toBookingConfirmation({ event, seats, bookings, quote }) {
  return {
    event: {
      id: event.id,
      name: event.name,
      venue: event.venue,
      city: event.city,
      starts_at: event.starts_at,
    },
    bookings: bookings.map((booking, i) => ({
      id: booking.id,
      status: booking.status,
      seat: {
        id: seats[i].id,
        seat_no: seats[i].seat_no,
        category: seats[i].category,
        price: toMoney(seats[i].price_paise),
      },
    })),
    pricing: {
      quote_id: quote.quoteId,
      subtotal: toMoney(quote.subtotalPaise),
      convenience_fee: toMoney(quote.convenienceFeePaise),
      gst: toMoney(quote.gstPaise),
      total: toMoney(quote.totalPaise),
    },
  };
}

module.exports = { toBookingConfirmation };
