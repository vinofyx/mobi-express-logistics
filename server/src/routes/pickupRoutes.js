const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/pickupController");

// POST /api/pickups/create
router.post("/create", controller.createPickup);

// GET  /api/pickups
router.get("/", controller.getPickups);

// PUT  /api/pickups/:id/status
router.put("/:id/status", controller.updatePickupStatus);

module.exports = router;
