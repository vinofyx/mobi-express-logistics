const express      = require('express');
const router       = express.Router();
const controller   = require('./pickup.controller');
const authenticate = require('../../middleware/authenticate');
const authorize    = require('../../middleware/authorize');
const validate     = require('../../middleware/validate');
const {
  createSchema,
  assignSchema,
  statusSchema,
  updateSchema,
} = require('./pickup.validator');

router.use(authenticate);

// GET    /api/v1/pickups
router.get('/', controller.list);

// POST   /api/v1/pickups
router.post(
  '/',
  authorize('admin', 'operations_manager', 'center_staff'),
  validate(createSchema),
  controller.create,
);

// GET    /api/v1/pickups/:id
router.get('/:id', controller.getOne);

// PATCH  /api/v1/pickups/:id
router.patch(
  '/:id',
  authorize('admin', 'operations_manager', 'center_staff'),
  validate(updateSchema),
  controller.update,
);

// PATCH  /api/v1/pickups/:id/assign
router.patch(
  '/:id/assign',
  authorize('admin', 'operations_manager'),
  validate(assignSchema),
  controller.assign,
);

// PATCH  /api/v1/pickups/:id/status
router.patch(
  '/:id/status',
  authorize('admin', 'operations_manager', 'center_staff', 'field_agent'),
  validate(statusSchema),
  controller.updateStatus,
);

// DELETE /api/v1/pickups/:id
router.delete('/:id', authorize('admin', 'operations_manager'), controller.remove);

module.exports = router;
