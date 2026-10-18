const { BadRequestError } = require('../errors/AppError');

function parseId(value, name = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`${name} must be a positive integer`);
  }
  return id;
}

module.exports = { parseId };
