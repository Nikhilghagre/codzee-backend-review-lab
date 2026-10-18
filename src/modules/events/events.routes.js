const { Router } = require('express');
const controller = require('./events.controller');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.get('/:id/seats', controller.listSeats);

module.exports = router;
