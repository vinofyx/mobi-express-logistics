const express       = require('express');
const router        = express.Router();
const controller    = require('./customer.controller');
// const authenticate  = require('../../middleware/authenticate');
// const authorize     = require('../../middleware/authorize');
// const validate      = require('../../middleware/validate');
// const { createSchema, updateSchema } = require('./customer.validator');

// router.use(authenticate); // Temporarily disabled for testing

// GET    /api/v1/customers
router.get('/', controller.list);

// POST   /api/v1/customers
router.post(
  '/',
  // authorize('admin', 'operations_manager', 'center_staff'),
  // validate(createSchema),
  controller.create,
);

// GET    /api/v1/customers/:id
router.get('/:id', controller.getOne);

// PATCH  /api/v1/customers/:id
router.patch(
  '/:id',
  // authorize('admin', 'operations_manager', 'center_staff'),
  // validate(updateSchema),
  controller.update,
);

// DELETE /api/v1/customers/:id  (soft delete — admin only)
router.delete('/:id', /* authorize('admin') */ controller.remove);

module.exports = router;
