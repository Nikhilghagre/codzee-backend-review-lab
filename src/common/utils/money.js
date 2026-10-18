// Money is always handled as integer paise internally (1 INR = 100 paise)
// and only converted to rupees for display.

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

function paiseToRupees(paise) {
  return paise / 100;
}

// 249900 -> "₹2,499.00", 10000000 -> "₹1,00,000.00"
function formatINR(paise) {
  return inrFormatter.format(paiseToRupees(paise));
}

function toMoney(paise) {
  return {
    amount_paise: paise,
    currency: 'INR',
    display: formatINR(paise),
  };
}

module.exports = { rupeesToPaise, paiseToRupees, formatINR, toMoney };
