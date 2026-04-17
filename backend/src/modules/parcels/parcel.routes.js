const express      = require('express');
const router       = express.Router();
const controller   = require('./parcel.controller');
// const authenticate = require('../../middleware/authenticate');
// const authorize    = require('../../middleware/authorize');
// const validate     = require('../../middleware/validate');
const { addSchema, updateSchema, statusSchema } = require('./parcel.validator');

// ✅ Public tracking (no auth)
router.get('/track/:trackingId', controller.track);

// 🔐 All routes below require authentication
// router.use(authenticate); // Temporarily disabled for testing

// ✅ GET all parcels
router.get('/', controller.list);

// ✅ CREATE parcel
router.post(
  '/',
  // authorize('admin', 'operations_manager', 'center_staff'), // Temporarily disabled
  validate(addSchema),
  controller.add
);

// ✅ GET single parcel
router.get('/:id', controller.getOne);

// ✅ UPDATE parcel
router.patch(
  '/:id',
  // authorize('admin', 'operations_manager', 'center_staff'), // Temporarily disabled
  validate(updateSchema),
  controller.update
);

// ✅ UPDATE status
router.patch(
  '/:id/status',
  // authorize('admin', 'operations_manager', 'center_staff', 'hub_staff'), // Temporarily disabled
  validate(statusSchema),
  controller.updateStatus
);

// ✅ DELETE parcel
router.delete('/:id', /* authorize('admin'), */ controller.remove); // Temporarily disabled

module.exports = router;