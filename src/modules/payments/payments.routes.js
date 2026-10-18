const { Router } = require('express');
const { requireUser } = require('../../common/middleware/auth');
const paymentsController = require('./payments.controller');

const router = Router();

router.post('/', requireUser, paymentsController.createPayment);

module.exports = router;
