const { Router } = require('express');
const { requireUser } = require('../../common/middleware/auth');
const bookingsController = require('./bookings.controller');

const router = Router();

router.post('/', requireUser, bookingsController.createBooking);

module.exports = router;
