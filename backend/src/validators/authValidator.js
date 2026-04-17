const Joi = require('joi');

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

// Register validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'agent', 'center_staff', 'customer').default('customer').messages({
    'any.only': 'Invalid role. Must be one of: admin, agent, center_staff, customer'
  }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid 10-digit mobile number',
    'any.required': 'Phone number is required'
  }),
  address: Joi.string().min(5).required().messages({
    'string.min': 'Address must be at least 5 characters',
    'any.required': 'Address is required'
  })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required'
  })
});

// Update profile validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters'
  }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().messages({
    'string.pattern.base': 'Please enter a valid 10-digit mobile number'
  }),
  address: Joi.string().min(5).optional().messages({
    'string.min': 'Address must be at least 5 characters'
  })
});

// Create user validation schema (admin)
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'agent', 'center_staff', 'customer').required().messages({
    'any.only': 'Invalid role. Must be one of: admin, agent, center_staff, customer',
    'any.required': 'Role is required'
  }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid 10-digit mobile number',
    'any.required': 'Phone number is required'
  }),
  address: Joi.string().min(5).required().messages({
    'string.min': 'Address must be at least 5 characters',
    'any.required': 'Address is required'
  })
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  updateProfileSchema,
  createUserSchema,
  refreshTokenSchema
};
