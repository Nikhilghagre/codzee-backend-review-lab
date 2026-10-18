process.env.DB_PATH = ':memory:';

const request = require('supertest');
const { createApp } = require('../src/app');
const { getDb, closeDb } = require('../src/db');
const { seed } = require('../src/db/seed');

const app = createApp();

beforeEach(() => seed(getDb()));
afterAll(() => closeDb());

describe('GET /api/bookings/me', () => {
  it('requires x-user-id', async () => {
    await request(app).get('/api/bookings/me').expect(401);
  });

  it('lists the current user bookings with event and seat details', async () => {
    const res = await request(app).get('/api/bookings/me').set('x-user-id', '1').expect(200);

    const { items, summary } = res.body.data;
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual(
      expect.objectContaining({
        status: 'CONFIRMED',
        event: expect.objectContaining({ name: expect.any(String), city: expect.any(String) }),
        seat: expect.objectContaining({ seat_no: expect.any(String), price: expect.any(Object) }),
      })
    );
    expect(summary.total_bookings).toBe(4);
    expect(summary.total_spent.display).toBe('₹14,996.00');
  });

  it('returns an empty list for a user with no bookings', async () => {
    const res = await request(app).get('/api/bookings/me').set('x-user-id', '2').expect(200);

    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.summary.total_spent.display).toBe('₹0.00');
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/bookings/me?status=cancelled').set('x-user-id', '1').expect(200);
    expect(res.body.data.items).toEqual([]);
  });

  it('rejects an unknown status', async () => {
    await request(app).get('/api/bookings/me?status=refunded').set('x-user-id', '1').expect(400);
  });
});
