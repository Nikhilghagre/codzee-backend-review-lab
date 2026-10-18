const paymentsRepository = require('./payments.repository');
const paymentGateway = require('../../integrations/paymentGateway');
const { toPaymentDetails } = require('./payments.mapper');
const { BOOKING_STATUS } = require('../bookings/bookings.constants');
const {
  NotFoundError,
  ConflictError,
  PaymentRequiredError,
  GatewayTimeoutError,
} = require('../../common/errors/AppError');

const GATEWAY_ERROR = Object.freeze({
  DECLINED: 'DECLINED',
  TIMEOUT: 'TIMEOUT',
});

async function payForBooking(userId, bookingId) {
  const booking = paymentsRepository.findUserBookingWithPrice(bookingId, userId);
  if (!booking) {
    throw new NotFoundError(`Booking ${bookingId} not found`);
  }
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ConflictError(`Booking ${bookingId} is already ${booking.status.toLowerCase()}`);
  }

  const amountPaise = booking.price_paise;

  let charge;
  try {
    charge = await paymentGateway.charge({
      amountPaise,
      userId,
      description: `Booking #${booking.id} - seat ${booking.seat_no}`,
    });
  } catch (err) {
    paymentsRepository.insertFailedPayment({ userId, amountPaise });

    if (err.code === GATEWAY_ERROR.DECLINED) {
      throw new PaymentRequiredError('Payment was declined by the bank');
    }
    if (err.code === GATEWAY_ERROR.TIMEOUT) {
      throw new GatewayTimeoutError('Payment gateway did not respond. Please try again.');
    }
    throw err;
  }

  const payment = paymentsRepository.recordSuccessfulPayment({
    bookingId: booking.id,
    userId,
    amountPaise,
    gatewayRef: charge.gatewayRef,
  });

  return toPaymentDetails(payment);
}

module.exports = { payForBooking };
