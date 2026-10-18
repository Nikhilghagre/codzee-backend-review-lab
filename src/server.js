const config = require('./config');
const { createApp } = require('./app');
const { getDb, closeDb } = require('./db');

getDb();

const server = createApp().listen(config.port, () => {
  console.log(`Ticket booking API listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
