# Ticket Booking API

A minimal ticket booking backend built with **Node.js, Express and SQLite**.
It covers events, seats, bookings and payments, with all prices in **Indian Rupees (INR)**.

## Quick start

```bash
npm install
cp .env.example .env   # optional
npm run seed           # creates ./data/tickets.db with sample data
npm run dev            # http://localhost:3000
npm test
```

Requires Node.js 22+.

## Project structure

```
src/
├── app.js                  # Express app: middleware, routes, error handling
├── server.js               # HTTP server bootstrap
├── config/                 # env-based configuration
├── db/                     # SQLite connection, schema, seed data
├── common/
│   ├── errors/             # AppError and HTTP error classes
│   ├── middleware/         # auth (x-user-id), error handler
│   └── utils/              # money (INR/paise), validation
├── integrations/
│   └── paymentGateway.js   # mock payment gateway
└── modules/                # one folder per feature
    ├── bookings/
    ├── events/             # routes -> controller -> service -> repository
    ├── payments/
    └── users/
```

Each module follows the same layers:

| Layer | Responsibility |
|---|---|
| `*.routes.js` | URL to handler mapping, middleware |
| `*.controller.js` | Reads the HTTP request, sends the response |
| `*.service.js` | Business rules, mapping to response shape |
| `*.repository.js` | SQL queries only |

## Money

- Stored and computed as **integer paise** (`₹1 = 100 paise`) to avoid floating-point errors.
- API responses return money as:
  ```json
  { "amount_paise": 249900, "currency": "INR", "display": "₹2,499.00" }
  ```
- `display` uses Indian digit grouping (`₹1,00,000.00`).

## Authentication

Simplified: the caller sends the authenticated user's id in the `x-user-id` header
(as if forwarded by an API gateway). Seeded users have ids `1`, `2` and `3`.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | - | Health check |
| GET | `/api/events` | - | List events with available seats and starting price |
| GET | `/api/events/:id` | - | Event details |
| GET | `/api/events/:id/seats` | - | Seats with price and availability |
| GET | `/api/users/me` | `x-user-id` | Current user |
| POST | `/api/payments` | `x-user-id` | Pay for a pending booking. Body: `{ "booking_id": 5 }`. Confirms the booking on success |

## Mock payment gateway

`src/integrations/paymentGateway.js` stands in for a real payment provider.
Configure it with `PAYMENT_LATENCY_MS`, `PAYMENT_FAILURE_RATE` and
`PAYMENT_TIMEOUT_RATE`.
