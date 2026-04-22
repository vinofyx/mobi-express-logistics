const express = require("express");
const router = express.Router();
const controller = require("../controllers/parcelController");

// POST /api/parcels/create
router.post("/create", controller.createParcel);

// GET /api/parcels
router.get("/", controller.getParcels);

// GET /api/parcels/sort-view
router.get("/sort-view", controller.getSortedView);

// GET /api/parcels/constants
router.get("/constants", controller.getConstants);

// POST /api/parcels/from-pickup
router.post("/from-pickup", controller.createFromPickup);

// GET /api/parcels/:id
router.get("/:id", controller.getParcelById);

// GET /api/parcels/tracking/:trackingId
router.get("/tracking/:trackingId", controller.getParcelByTrackingId);

// PUT /api/parcels/:id/status
router.put("/:id/status", controller.updateParcelStatus);

// PUT /api/parcels/:id/damage
router.put("/:id/damage", controller.markParcelDamage);

module.exports = router;
