const crypto = require('crypto');
const config = require('../config');

const CONVENIENCE_FEE_RATE = 0.02;
const GST_RATE_ON_FEE = 0.18;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getQuote({ eventId, seats }) {
  await sleep(config.pricing.latencyMs);

  const subtotalPaise = seats.reduce((sum, seat) => sum + seat.price_paise, 0);
  const convenienceFeePaise = Math.round(subtotalPaise * CONVENIENCE_FEE_RATE);
  const gstPaise = Math.round(convenienceFeePaise * GST_RATE_ON_FEE);

  return {
    quoteId: `qt_${crypto.randomBytes(6).toString('hex')}`,
    eventId,
    subtotalPaise,
    convenienceFeePaise,
    gstPaise,
    totalPaise: subtotalPaise + convenienceFeePaise + gstPaise,
  };
}

module.exports = { getQuote };
