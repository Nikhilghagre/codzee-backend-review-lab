const { Router } = require('express');
const { requireUser } = require('../../common/middleware/auth');
const bookingsController = require('./bookings.controller');

const router = Router();

router.get('/me', requireUser, bookingsController.getMyBookings);

module.exports = router;
