const crypto = require('crypto');
const config = require('../config');

class PaymentGatewayError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'PaymentGatewayError';
    this.code = code;
  }
}

const charges = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function charge({ amountPaise, userId, description }) {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new PaymentGatewayError('Invalid amount', 'INVALID_AMOUNT');
  }

  await sleep(config.payment.latencyMs);

  const roll = Math.random();
  if (roll < config.payment.failureRate) {
    throw new PaymentGatewayError('Payment declined by bank', 'DECLINED');
  }

  const gatewayRef = `pay_${crypto.randomBytes(8).toString('hex')}`;
  charges.push({
    gatewayRef,
    userId,
    amountPaise,
    description,
    status: 'CAPTURED',
    capturedAt: new Date().toISOString(),
  });

  if (roll < config.payment.failureRate + config.payment.timeoutRate) {
    throw new PaymentGatewayError('Gateway timeout', 'TIMEOUT');
  }

  return { gatewayRef, status: 'SUCCESS', amountPaise };
}

async function refund(gatewayRef) {
  await sleep(config.payment.latencyMs);

  const captured = charges.find((c) => c.gatewayRef === gatewayRef);
  if (!captured) {
    throw new PaymentGatewayError('Charge not found', 'NOT_FOUND');
  }
  captured.status = 'REFUNDED';
  return { gatewayRef, status: 'REFUNDED' };
}

function getCharges() {
  return charges.map((c) => ({ ...c }));
}

function resetCharges() {
  charges.length = 0;
}

module.exports = { charge, refund, getCharges, resetCharges, PaymentGatewayError };
