process.env.DB_PATH = ':memory:';
process.env.PRICING_LATENCY_MS = '0';

const request = require('supertest');
const { createApp } = require('../src/app');
const { getDb, closeDb } = require('../src/db');
const { seed } = require('../src/db/seed');

const app = createApp();

// Seeded layout: event 1 seats 1-50 (A1 = 1, B2 = 12, B3 = 13), event 2 seats 51-100.
const EVENT_ID = 1;
const SEAT_A1_CONFIRMED = 1;
const SEAT_B2 = 12;
const SEAT_B3 = 13;
const SEAT_FROM_EVENT_2 = 60;

const bookSeats = (userId, body) => request(app).post('/api/bookings').set('x-user-id', String(userId)).send(body);

beforeEach(() => seed(getDb()));
afterAll(() => closeDb());

describe('POST /api/bookings', () => {
  it('requires x-user-id', async () => {
    await request(app).post('/api/bookings').send({ event_id: EVENT_ID, seat_ids: [SEAT_B2] }).expect(401);
  });

  it('creates pending bookings with a price breakdown', async () => {
    const res = await bookSeats(2, { event_id: EVENT_ID, seat_ids: [SEAT_B2, SEAT_B3] }).expect(201);

    const { bookings, pricing } = res.body.data;
    expect(bookings).toHaveLength(2);
    expect(bookings.map((b) => b.status)).toEqual(['PENDING', 'PENDING']);
    expect(bookings.map((b) => b.seat.seat_no)).toEqual(['B2', 'B3']);
    expect(pricing.subtotal.display).toBe('₹4,998.00');
    expect(pricing.convenience_fee.display).toBe('₹99.96');
    expect(pricing.gst.display).toBe('₹17.99');
    expect(pricing.total.display).toBe('₹5,115.95');
  });

  it('rejects a seat that is already booked', async () => {
    const res = await bookSeats(2, { event_id: EVENT_ID, seat_ids: [SEAT_A1_CONFIRMED] }).expect(409);
    expect(res.body.error.message).toBe('Seats A1 are already booked');
  });

  it('prevents double booking of the same seat', async () => {
    const first = await bookSeats(2, { event_id: EVENT_ID, seat_ids: [SEAT_B2] }).expect(201);
    getDb()
      .prepare("UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?")
      .run(first.body.data.bookings[0].id);

    await bookSeats(3, { event_id: EVENT_ID, seat_ids: [SEAT_B2] }).expect(409);
  });

  it('rejects seats from a different event', async () => {
    await bookSeats(2, { event_id: EVENT_ID, seat_ids: [SEAT_B2, SEAT_FROM_EVENT_2] }).expect(400);
  });

  it('rejects more than 6 seats', async () => {
    await bookSeats(2, { event_id: EVENT_ID, seat_ids: [11, 12, 13, 14, 16, 17, 18] }).expect(400);
  });

  it('allows booking on behalf of another user', async () => {
    const res = await bookSeats(1, { event_id: EVENT_ID, seat_ids: [SEAT_B3], user_id: 3 }).expect(201);

    const booking = getDb().prepare('SELECT user_id FROM bookings WHERE id = ?').get(res.body.data.bookings[0].id);
    expect(booking.user_id).toBe(3);
  });

  it('returns 404 for an unknown event', async () => {
    await bookSeats(2, { event_id: 999, seat_ids: [SEAT_B2] }).expect(404);
  });
});
