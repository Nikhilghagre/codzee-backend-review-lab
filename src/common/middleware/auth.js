const usersRepository = require('../../modules/users/users.repository');
const { UnauthorizedError } = require('../errors/AppError');

// Simplified auth for this service: the API gateway forwards the
// authenticated user's id in the `x-user-id` header.
function requireUser(req, res, next) {
  const userId = Number(req.header('x-user-id'));
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new UnauthorizedError('Missing or invalid x-user-id header');
  }

  const user = usersRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  req.user = user;
  next();
}

module.exports = { requireUser };
