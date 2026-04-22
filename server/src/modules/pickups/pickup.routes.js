const express      = require('express');
const router       = express.Router();
const controller   = require('./pickup.controller');
// const authenticate = require('../../middleware/authenticate');
// const authorize    = require('../../middleware/authorize');
// const validate     = require('../../middleware/validate');
// const { createSchema, assignSchema, statusSchema, updateSchema } = require('./pickup.validator');

// router.use(authenticate); // Temporarily disabled for testing

// GET  /api/pickups
router.get('/', controller.list);

// POST /api/pickups
router.post('/', controller.create);

// GET  /api/pickups/:id
router.get('/:id', controller.getOne);

// PATCH /api/pickups/:id
router.patch('/:id', controller.update);

// PATCH /api/pickups/:id/assign
router.patch('/:id/assign', controller.assign);

// PATCH /api/pickups/:id/status
router.patch('/:id/status', controller.updateStatus);

// DELETE /api/pickups/:id
router.delete('/:id', controller.remove);

module.exports = router;
