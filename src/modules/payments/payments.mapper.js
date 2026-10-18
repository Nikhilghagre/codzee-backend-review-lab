const { toMoney } = require('../../common/utils/money');

function toPaymentDetails(payment) {
  return {
    id: payment.id,
    booking_id: payment.booking_id,
    status: payment.status,
    amount: toMoney(payment.amount_paise),
    gateway_ref: payment.gateway_ref,
    paid_at: payment.created_at,
  };
}

module.exports = { toPaymentDetails };
