const express        = require("express");
const router         = express.Router();
const controller     = require("./auth.controller");
const authenticate   = require("../../middleware/authenticate");

// Public routes
router.post("/register",      controller.register);
router.post("/login",         controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout",        controller.logout);

// Protected route — requires valid JWT
router.get("/me", authenticate, controller.me);

module.exports = router;
