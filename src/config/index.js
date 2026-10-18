const path = require('path');

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const dbPath = process.env.DB_PATH || './data/tickets.db';

module.exports = {
  port: toNumber(process.env.PORT, 3000),
  dbPath: dbPath === ':memory:' ? dbPath : path.resolve(dbPath),
  currency: 'INR',
  payment: {
    latencyMs: toNumber(process.env.PAYMENT_LATENCY_MS, 300),
    failureRate: toNumber(process.env.PAYMENT_FAILURE_RATE, 0.05),
    timeoutRate: toNumber(process.env.PAYMENT_TIMEOUT_RATE, 0.05),
  },
  pricing: {
    latencyMs: toNumber(process.env.PRICING_LATENCY_MS, 200),
  },
};
