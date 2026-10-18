const { getDb, closeDb } = require('./index');

const USERS = [
  { name: 'Aarav Sharma', email: 'aarav@example.in', phone: '+919800000001' },
  { name: 'Priya Iyer', email: 'priya@example.in', phone: '+919800000002' },
  { name: 'Rohan Mehta', email: 'rohan@example.in', phone: '+919800000003' },
];

const EVENTS = [
  {
    name: 'Arijit Singh Live',
    venue: 'NSCI Dome',
    city: 'Mumbai',
    starts_at: '2026-12-20T19:00:00+05:30',
  },
  {
    name: 'Stand-up Comedy Night',
    venue: 'Phoenix Marketcity Arena',
    city: 'Bengaluru',
    starts_at: '2026-11-28T20:30:00+05:30',
  },
];

// Row -> category and price (in paise)
const SEAT_LAYOUT = [
  { row: 'A', category: 'PLATINUM', pricePaise: 4_999_00 },
  { row: 'B', category: 'GOLD', pricePaise: 2_499_00 },
  { row: 'C', category: 'GOLD', pricePaise: 2_499_00 },
  { row: 'D', category: 'SILVER', pricePaise: 999_00 },
  { row: 'E', category: 'SILVER', pricePaise: 999_00 },
];
const SEATS_PER_ROW = 10;

function seed(db = getDb()) {
  const run = db.transaction(() => {
    db.exec(`
      DELETE FROM bookings;
      DELETE FROM payments;
      DELETE FROM seats;
      DELETE FROM events;
      DELETE FROM users;
      DELETE FROM sqlite_sequence;
    `);

    const insertUser = db.prepare('INSERT INTO users (name, email, phone) VALUES (@name, @email, @phone)');
    const insertEvent = db.prepare(
      'INSERT INTO events (name, venue, city, starts_at) VALUES (@name, @venue, @city, @starts_at)'
    );
    const insertSeat = db.prepare(
      'INSERT INTO seats (event_id, seat_no, category, price_paise) VALUES (?, ?, ?, ?)'
    );
    const insertPayment = db.prepare(
      "INSERT INTO payments (user_id, amount_paise, status, gateway_ref) VALUES (?, ?, 'SUCCESS', ?)"
    );
    const insertBooking = db.prepare(
      "INSERT INTO bookings (user_id, seat_id, payment_id, status) VALUES (?, ?, ?, 'CONFIRMED')"
    );

    USERS.forEach((user) => insertUser.run(user));

    EVENTS.forEach((event) => {
      const { lastInsertRowid: eventId } = insertEvent.run(event);
      SEAT_LAYOUT.forEach(({ row, category, pricePaise }) => {
        for (let n = 1; n <= SEATS_PER_ROW; n += 1) {
          insertSeat.run(eventId, `${row}${n}`, category, pricePaise);
        }
      });
    });

    // A few existing confirmed bookings for user 1
    const seats = db.prepare("SELECT id, price_paise FROM seats WHERE seat_no IN ('A1', 'B5')").all();
    seats.forEach((seat, i) => {
      const { lastInsertRowid: paymentId } = insertPayment.run(1, seat.price_paise, `pay_seed_${i + 1}`);
      insertBooking.run(1, seat.id, paymentId);
    });
  });

  run();
}

if (require.main === module) {
  seed();
  closeDb();
  console.log('Database seeded');
}

module.exports = { seed };
