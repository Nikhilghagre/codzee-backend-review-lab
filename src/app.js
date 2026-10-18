const express = require('express');
const eventsRoutes = require('./modules/events/events.routes');
const usersRoutes = require('./modules/users/users.routes');
const bookingsRoutes = require('./modules/bookings/bookings.routes');
const { notFoundHandler, errorHandler } = require('./common/middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/events', eventsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/bookings', bookingsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
