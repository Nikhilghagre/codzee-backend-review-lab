const service = require('./events.service');
const { parseId } = require('../../common/utils/validate');

function list(req, res) {
  res.json({ data: service.listEvents() });
}

function getById(req, res) {
  res.json({ data: service.getEvent(parseId(req.params.id, 'eventId')) });
}

function listSeats(req, res) {
  res.json({ data: service.listSeats(parseId(req.params.id, 'eventId')) });
}

module.exports = { list, getById, listSeats };
