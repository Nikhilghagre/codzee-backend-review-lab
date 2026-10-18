const paymentsService = require('./payments.service');
const { parseCreatePaymentBody } = require('./payments.validator');

async function createPayment(req, res) {
  const { bookingId } = parseCreatePaymentBody(req.body);
  const payment = await paymentsService.payForBooking(req.user.id, bookingId);

  res.status(201).json({ data: payment });
}

module.exports = { createPayment };
