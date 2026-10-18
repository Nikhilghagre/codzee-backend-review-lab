const express = require('express');
const eventsRoutes = require('./modules/events/events.routes');
const usersRoutes = require('./modules/users/users.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const { notFoundHandler, errorHandler } = require('./common/middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/events', eventsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/payments', paymentsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
