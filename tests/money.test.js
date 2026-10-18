const { rupeesToPaise, formatINR, toMoney } = require('../src/common/utils/money');

describe('money utils', () => {
  it('converts rupees to integer paise without float drift', () => {
    expect(rupeesToPaise(19.99)).toBe(1999);
    expect(rupeesToPaise('0.1')).toBe(10);
  });

  it('formats with Indian digit grouping', () => {
    expect(formatINR(249900)).toBe('₹2,499.00');
    expect(formatINR(10000000)).toBe('₹1,00,000.00');
  });

  it('builds a money object', () => {
    expect(toMoney(99900)).toEqual({ amount_paise: 99900, currency: 'INR', display: '₹999.00' });
  });
});
