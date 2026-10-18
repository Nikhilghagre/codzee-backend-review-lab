const { Router } = require('express');
const { requireUser } = require('../../common/middleware/auth');
const controller = require('./users.controller');

const router = Router();

router.get('/me', requireUser, controller.getMe);

module.exports = router;
