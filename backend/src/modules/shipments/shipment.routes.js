const express      = require('express');
const router       = express.Router();
const controller   = require('./shipment.controller.mock');
// const authenticate = require('../../middleware/authenticate');
// const authorize    = require('../../middleware/authorize');
// const validate     = require('../../middleware/validate');
const {
  createSchema,
  assignParcelsSchema,
  statusSchema,
} = require('./shipment.validator');

// router.use(authenticate); // Temporarily disabled for testing

// GET    /api/v1/shipments
router.get('/', controller.list);

// GET /api/v1/shipments/track/:shipmentId - Public tracking
router.get('/track/:shipmentId', controller.track);

// POST   /api/v1/shipments
router.post(
  '/',
  // authorize('admin', 'operations_manager'), // Temporarily disabled
  // validate(createSchema), // Temporarily disabled
  controller.create,
);

// GET    /api/v1/shipments/:id
router.get('/:id', controller.getOne);

// POST   /api/v1/shipments/:id/parcels  — add parcels to shipment
router.post(
  '/:id/parcels',
  // authorize('admin', 'operations_manager', 'hub_staff'), // Temporarily disabled
  // validate(assignParcelsSchema), // Temporarily disabled
  controller.assignParcels,
);

// PATCH  /api/v1/shipments/:id/status
router.patch(
  '/:id/status',
  // authorize('admin', 'operations_manager', 'hub_staff'), // Temporarily disabled
  // validate(statusSchema), // Temporarily disabled
  controller.updateStatus,
);

// DELETE /api/v1/shipments/:id
router.delete('/:id', /* authorize('admin'), */ controller.remove); // Temporarily disabled

module.exports = router;

