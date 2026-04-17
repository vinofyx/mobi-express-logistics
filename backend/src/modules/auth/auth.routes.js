const express    = require('express');
const router     = express.Router();
const controller = require('./auth.controller');
const validate   = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./auth.validator');

// POST  /api/v1/auth/register
router.post('/register', validate(registerSchema), controller.register);

// POST  /api/v1/auth/login
router.post('/login', validate(loginSchema), controller.login);

// POST  /api/v1/auth/refresh-token
router.post('/refresh-token', controller.refreshToken);

// POST  /api/v1/auth/logout
router.post('/logout', controller.logout);

module.exports = router;
