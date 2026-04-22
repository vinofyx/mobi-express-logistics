const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/customerController");

// POST /api/customers/create
router.post("/create", controller.createCustomer);

// GET  /api/customers
router.get("/", controller.getCustomers);

module.exports = router;
