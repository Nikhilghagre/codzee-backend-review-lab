process.env.DB_PATH = ':memory:';

const request = require('supertest');
const { createApp } = require('../src/app');
const { getDb, closeDb } = require('../src/db');
const { seed } = require('../src/db/seed');

const app = createApp();

beforeEach(() => seed(getDb()));
afterAll(() => closeDb());

describe('GET /api/events', () => {
  it('lists events with availability and INR starting price', async () => {
    const res = await request(app).get('/api/events').expect(200);

    expect(res.body.data).toHaveLength(2);
    const mumbai = res.body.data.find((e) => e.city === 'Mumbai');
    expect(mumbai.total_seats).toBe(50);
    expect(mumbai.available_seats).toBe(48);
    expect(mumbai.starting_from).toEqual({ amount_paise: 99900, currency: 'INR', display: '₹999.00' });
  });
});

describe('GET /api/events/:id/seats', () => {
  it('marks booked seats as unavailable', async () => {
    const res = await request(app).get('/api/events/1/seats').expect(200);

    const a1 = res.body.data.find((s) => s.seat_no === 'A1');
    const a2 = res.body.data.find((s) => s.seat_no === 'A2');
    expect(a1.is_available).toBe(false);
    expect(a2.is_available).toBe(true);
    expect(a2.price.display).toBe('₹4,999.00');
  });

  it('returns 404 for an unknown event', async () => {
    await request(app).get('/api/events/999/seats').expect(404);
  });

  it('returns 400 for an invalid id', async () => {
    await request(app).get('/api/events/abc/seats').expect(400);
  });
});

describe('GET /api/users/me', () => {
  it('requires x-user-id', async () => {
    await request(app).get('/api/users/me').expect(401);
  });

  it('returns the current user', async () => {
    const res = await request(app).get('/api/users/me').set('x-user-id', '2').expect(200);
    expect(res.body.data.name).toBe('Priya Iyer');
  });
});
