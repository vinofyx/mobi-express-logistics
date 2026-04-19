const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
// const { validate } = require('../middleware/validate');
// const { loginSchema, registerSchema, changePasswordSchema, updateProfileSchema } = require('../validators/authValidator');

// Public routes (no authentication required)
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (authentication required)
router.use(authenticate);

// User profile routes
router.get('/profile', authController.getProfile);
// router.put('/profile', validate(updateProfileSchema), authController.updateProfile);
// router.put('/change-password', validate(changePasswordSchema), authController.changePassword);
router.post('/logout', authController.logout);

// Admin only routes
router.get('/users', authorize('admin'), authController.getAllUsers);
router.post('/users', authorize('admin'), authController.createUser);
router.put('/users/:id/status', authorize('admin'), authController.updateUserStatus);

module.exports = router;
