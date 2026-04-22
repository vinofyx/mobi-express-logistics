const express      = require('express');
const router       = express.Router();
const controller   = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const authorize    = require('../../middleware/authorize');

router.use(authenticate);

// GET  /api/v1/users/me  — current user profile
router.get('/me', controller.getMe);

// Admin-only routes below
// GET    /api/v1/users
router.get('/', authorize('admin'), controller.list);

// GET    /api/v1/users/:id
router.get('/:id', authorize('admin'), controller.getOne);

// PATCH  /api/v1/users/:id
router.patch('/:id', authorize('admin'), controller.update);

// PATCH  /api/v1/users/:id/role
router.patch('/:id/role', authorize('admin'), controller.changeRole);

// PATCH  /api/v1/users/:id/toggle-active
router.patch('/:id/toggle-active', authorize('admin'), controller.toggleActive);

module.exports = router;
