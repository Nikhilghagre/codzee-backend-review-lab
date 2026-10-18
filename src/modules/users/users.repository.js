const { getDb } = require('../../db');

function findById(id) {
  return getDb().prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?').get(id);
}

module.exports = { findById };
