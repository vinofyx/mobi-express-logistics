const express       = require('express');
const router        = express.Router();
const controller    = require('./customer.controller');
const { 
  createSchema, 
  updateSchema, 
  tagSchema, 
  searchSchema, 
  creditLimitSchema 
} = require('./customer.validator');

// Uncomment these when middleware is ready
// const authenticate  = require('../../middleware/authenticate');
// const authorize     = require('../../middleware/authorize');
// const validate      = require('../../middleware/validate');

// router.use(authenticate); // Apply authentication to all routes

// ─── Basic CRUD Operations ──────────────────────────────────────────────────────

// GET    /api/v1/customers - List customers with filtering and pagination
router.get('/', 
  // validate(searchSchema),
  controller.list
);

// POST   /api/v1/customers - Create new customer
router.post(
  '/',
  // authorize('admin', 'operations_manager', 'center_staff'),
  // validate(createSchema),
  controller.create
);

// GET    /api/v1/customers/search - Advanced search with multiple filters
router.get('/search',
  // validate(searchSchema),
  controller.search
);

// GET    /api/v1/customers/stats - Get customer statistics
router.get('/stats',
  // authorize('admin', 'operations_manager', 'data_analyst'),
  controller.getStats
);

// GET    /api/v1/customers/export - Export customers data
router.get('/export',
  // authorize('admin', 'operations_manager', 'data_analyst'),
  controller.export
);

// POST   /api/v1/customers/bulk-update - Bulk update customers
router.post('/bulk-update',
  // authorize('admin', 'operations_manager'),
  controller.bulkUpdate
);

// GET    /api/v1/customers/phone/:phone - Find customer by phone number
router.get('/phone/:phone',
  controller.findByPhone
);

// ─── Individual Customer Operations ─────────────────────────────────────────────

// GET    /api/v1/customers/:id - Get single customer
router.get('/:id', controller.getOne);

// PATCH  /api/v1/customers/:id - Update customer
router.patch(
  '/:id',
  // authorize('admin', 'operations_manager', 'center_staff'),
  // validate(updateSchema),
  controller.update
);

// DELETE /api/v1/customers/:id - Soft delete customer
router.delete(
  '/:id',
  // authorize('admin', 'operations_manager'),
  controller.remove
);

// ─── Tag Management ─────────────────────────────────────────────────────────────

// POST   /api/v1/customers/:id/tags - Add tag to customer
router.post(
  '/:id/tags',
  // authorize('admin', 'operations_manager', 'center_staff'),
  // validate(tagSchema),
  controller.addTag
);

// DELETE /api/v1/customers/:id/tags/:tag - Remove tag from customer
router.delete(
  '/:id/tags/:tag',
  // authorize('admin', 'operations_manager', 'center_staff'),
  controller.removeTag
);

// ─── Credit Management ─────────────────────────────────────────────────────────

// PATCH  /api/v1/customers/:id/credit-limit - Update customer credit limit
router.patch(
  '/:id/credit-limit',
  // authorize('admin', 'operations_manager'),
  // validate(creditLimitSchema),
  controller.updateCreditLimit
);

// ─── Order Related Operations ─────────────────────────────────────────────────

// POST   /api/v1/customers/:id/update-order-stats - Update order statistics
router.post(
  '/:id/update-order-stats',
  // authorize('admin', 'operations_manager', 'center_staff', 'system'),
  controller.updateOrderStats
);

module.exports = router;
