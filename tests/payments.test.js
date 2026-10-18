process.env.DB_PATH = ':memory:';
process.env.PAYMENT_LATENCY_MS = '0';
process.env.PAYMENT_FAILURE_RATE = '0';
process.env.PAYMENT_TIMEOUT_RATE = '0';

const request = require('supertest');
const { createApp } = require('../src/app');
const { getDb, closeDb } = require('../src/db');
const { seed } = require('../src/db/seed');
const paymentGateway = require('../src/integrations/paymentGateway');

const app = createApp();

const PENDING_BOOKING_ID = 5; // seeded for user 2
const CONFIRMED_BOOKING_ID = 1; // seeded for user 1

const findBooking = (id) => getDb().prepare('SELECT status, payment_id FROM bookings WHERE id = ?').get(id);

beforeEach(() => {
  seed(getDb());
  paymentGateway.resetCharges();
});
afterEach(() => jest.restoreAllMocks());
afterAll(() => closeDb());

describe('POST /api/payments', () => {
  it('requires x-user-id', async () => {
    await request(app).post('/api/payments').send({ booking_id: PENDING_BOOKING_ID }).expect(401);
  });

  it('validates booking_id', async () => {
    await request(app).post('/api/payments').set('x-user-id', '2').send({}).expect(400);
    await request(app).post('/api/payments').set('x-user-id', '2').send({ booking_id: 'abc' }).expect(400);
  });

  it('charges the seat price and confirms the booking', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('x-user-id', '2')
      .send({ booking_id: PENDING_BOOKING_ID })
      .expect(201);

    expect(res.body.data).toEqual(
      expect.objectContaining({
        booking_id: PENDING_BOOKING_ID,
        status: 'SUCCESS',
        amount: { amount_paise: 499900, currency: 'INR', display: '₹4,999.00' },
        gateway_ref: expect.stringMatching(/^pay_/),
      })
    );
    expect(findBooking(PENDING_BOOKING_ID)).toEqual({ status: 'CONFIRMED', payment_id: res.body.data.id });
  });

  it("returns 404 for another user's booking", async () => {
    await request(app).post('/api/payments').set('x-user-id', '1').send({ booking_id: PENDING_BOOKING_ID }).expect(404);
  });

  it('returns 409 for a booking that is already confirmed', async () => {
    await request(app).post('/api/payments').set('x-user-id', '1').send({ booking_id: CONFIRMED_BOOKING_ID }).expect(409);
  });

  it('returns 402 when the bank declines the payment', async () => {
    jest
      .spyOn(paymentGateway, 'charge')
      .mockRejectedValue(new paymentGateway.PaymentGatewayError('Payment declined by bank', 'DECLINED'));

    await request(app).post('/api/payments').set('x-user-id', '2').send({ booking_id: PENDING_BOOKING_ID }).expect(402);

    expect(findBooking(PENDING_BOOKING_ID).status).toBe('PENDING');
  });

  it('returns 504 when the gateway times out', async () => {
    jest
      .spyOn(paymentGateway, 'charge')
      .mockRejectedValue(new paymentGateway.PaymentGatewayError('Gateway timeout', 'TIMEOUT'));

    await request(app).post('/api/payments').set('x-user-id', '2').send({ booking_id: PENDING_BOOKING_ID }).expect(504);
  });
});
