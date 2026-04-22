const express    = require('express');
const router     = express.Router();
const controller = require('./auth.controller');

// Register user
router.post('/register', controller.register);

// Login user
router.post('/login', controller.login);

// Logout user
router.post('/logout', controller.logout);

// Refresh token
router.post('/refresh-token', controller.refreshToken);

// Get current user
router.get('/me', controller.getMe);

module.exports = router;
