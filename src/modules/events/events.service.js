const repository = require('./events.repository');
const { NotFoundError } = require('../../common/errors/AppError');
const { toMoney } = require('../../common/utils/money');

function listEvents() {
  return repository.findAll().map(({ min_price_paise: minPricePaise, ...event }) => ({
    ...event,
    starting_from: minPricePaise == null ? null : toMoney(minPricePaise),
  }));
}

function getEvent(id) {
  const event = repository.findById(id);
  if (!event) throw new NotFoundError(`Event ${id} not found`);
  return event;
}

function listSeats(eventId) {
  getEvent(eventId);

  return repository.findSeatsByEventId(eventId).map(({ price_paise: pricePaise, is_available: isAvailable, ...seat }) => ({
    ...seat,
    price: toMoney(pricePaise),
    is_available: Boolean(isAvailable),
  }));
}

module.exports = { listEvents, getEvent, listSeats };
