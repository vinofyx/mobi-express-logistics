const Joi = require('joi');

const addressSchema = Joi.object({
  line1: Joi.string()
    .required()
    .min(5)
    .max(200)
    .trim()
    .messages({
      'string.empty': 'Address line 1 is required.',
      'string.min': 'Address line 1 must be at least 5 characters.',
      'string.max': 'Address line 1 must not exceed 200 characters.'
    }),
  line2: Joi.string()
    .optional()
    .max(200)
    .allow('')
    .trim()
    .messages({
      'string.max': 'Address line 2 must not exceed 200 characters.'
    }),
  city: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'City is required.',
      'string.min': 'City must be at least 2 characters.',
      'string.max': 'City must not exceed 100 characters.'
    }),
  state: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'State is required.',
      'string.min': 'State must be at least 2 characters.',
      'string.max': 'State must not exceed 100 characters.'
    }),
  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      'string.pattern.base': 'PIN code must be exactly 6 digits starting with 1-9.',
      'string.empty': 'PIN code is required.'
    }),
  country: Joi.string()
    .optional()
    .max(100)
    .default('India')
    .trim()
    .messages({
      'string.max': 'Country must not exceed 100 characters.'
    })
});

const b2bValidation = Joi.when('type', {
  is: 'B2B',
  then: Joi.required().messages({
    'any.required': 'Company name is required for B2B customers.'
  }),
  otherwise: Joi.optional()
});

exports.createSchema = Joi.object({
  type: Joi.string()
    .valid('B2B', 'B2C')
    .default('B2C')
    .messages({
      'any.only': 'Customer type must be either B2B or B2C.'
    }),
  name: Joi.string()
    .required()
    .min(2)
    .max(150)
    .trim()
    .messages({
      'string.empty': 'Customer name is required.',
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name must not exceed 150 characters.'
    }),
  companyName: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .when('type', {
      is: 'B2B',
      then: Joi.required().messages({
        'any.required': 'Company name is required for B2B customers.'
      }),
      otherwise: Joi.optional().allow('')
    })
    .messages({
      'string.min': 'Company name must be at least 2 characters.',
      'string.max': 'Company name must not exceed 200 characters.'
    }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number starting with 6-9.',
      'string.empty': 'Phone number is required.'
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow('')
    .trim()
    .messages({
      'string.email': 'Please provide a valid email address.'
    }),
  address: addressSchema.required(),
  gst: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .allow('')
    .messages({ 
      'string.pattern.base': 'Invalid GST number format.' 
    }),
  pan: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .allow('')
    .uppercase()
    .messages({
      'string.pattern.base': 'Invalid PAN number format (e.g., ABCDE1234F).'
    }),
  creditLimit: Joi.number()
    .optional()
    .default(0)
    .min(0)
    .messages({
      'number.min': 'Credit limit cannot be negative.',
      'number.base': 'Credit limit must be a number.'
    }),
  tags: Joi.array()
    .optional()
    .items(
      Joi.string()
        .max(50)
        .trim()
        .messages({
          'string.max': 'Each tag must not exceed 50 characters.'
        })
    )
    .messages({
      'array.base': 'Tags must be an array.'
    }),
  notes: Joi.string()
    .optional()
    .max(1000)
    .allow('')
    .trim()
    .messages({
      'string.max': 'Notes must not exceed 1000 characters.'
    }),
  isVerified: Joi.boolean()
    .optional()
    .default(false)
});

exports.updateSchema = Joi.object({
  type: Joi.string()
    .valid('B2B', 'B2C')
    .messages({
      'any.only': 'Customer type must be either B2B or B2C.'
    }),
  name: Joi.string()
    .optional()
    .min(2)
    .max(150)
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name must not exceed 150 characters.'
    }),
  companyName: Joi.string()
    .optional()
    .min(2)
    .max(200)
    .trim()
    .allow('')
    .messages({
      'string.min': 'Company name must be at least 2 characters.',
      'string.max': 'Company name must not exceed 200 characters.'
    }),
  phone: Joi.string()
    .optional()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number.'
    }),
  email: Joi.string()
    .optional()
    .email()
    .allow('')
    .trim()
    .messages({
      'string.email': 'Please provide a valid email address.'
    }),
  address: addressSchema.optional(),
  gst: Joi.string()
    .optional()
    .allow('')
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .messages({ 
      'string.pattern.base': 'Invalid GST number format.' 
    }),
  pan: Joi.string()
    .optional()
    .allow('')
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .uppercase()
    .messages({
      'string.pattern.base': 'Invalid PAN number format.'
    }),
  creditLimit: Joi.number()
    .optional()
    .min(0)
    .messages({
      'number.min': 'Credit limit cannot be negative.',
      'number.base': 'Credit limit must be a number.'
    }),
  outstandingBalance: Joi.number()
    .optional()
    .min(0)
    .messages({
      'number.min': 'Outstanding balance cannot be negative.',
      'number.base': 'Outstanding balance must be a number.'
    }),
  isActive: Joi.boolean()
    .optional(),
  isVerified: Joi.boolean()
    .optional(),
  tags: Joi.array()
    .optional()
    .items(
      Joi.string()
        .max(50)
        .trim()
        .messages({
          'string.max': 'Each tag must not exceed 50 characters.'
        })
    ),
  notes: Joi.string()
    .optional()
    .max(1000)
    .allow('')
    .trim()
    .messages({
      'string.max': 'Notes must not exceed 1000 characters.'
    }),
  lastOrderDate: Joi.date()
    .optional(),
  totalOrders: Joi.number()
    .optional()
    .min(0)
    .messages({
      'number.min': 'Total orders cannot be negative.',
      'number.base': 'Total orders must be a number.'
    })
}).min(1).messages({ 
  'object.min': 'Provide at least one field to update.' 
});

// Schema for tag operations
exports.tagSchema = Joi.object({
  tag: Joi.string()
    .required()
    .min(1)
    .max(50)
    .trim()
    .messages({
      'string.empty': 'Tag is required.',
      'string.min': 'Tag must be at least 1 character.',
      'string.max': 'Tag must not exceed 50 characters.'
    })
});

// Schema for search parameters
exports.searchSchema = Joi.object({
  query: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
      'string.max': 'Search query must not exceed 100 characters.'
    }),
  type: Joi.string()
    .optional()
    .valid('B2B', 'B2C')
    .messages({
      'any.only': 'Type must be either B2B or B2C.'
    }),
  city: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
      'string.max': 'City filter must not exceed 100 characters.'
    }),
  state: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
      'string.max': 'State filter must not exceed 100 characters.'
    }),
  page: Joi.number()
    .optional()
    .default(1)
    .min(1)
    .messages({
      'number.min': 'Page must be at least 1.',
      'number.base': 'Page must be a number.'
    }),
  limit: Joi.number()
    .optional()
    .default(10)
    .min(1)
    .max(100)
    .messages({
      'number.min': 'Limit must be at least 1.',
      'number.max': 'Limit must not exceed 100.',
      'number.base': 'Limit must be a number.'
    }),
  sortBy: Joi.string()
    .optional()
    .default('createdAt')
    .valid('createdAt', 'name', 'companyName', 'phone', 'email', 'lastOrderDate', 'totalOrders')
    .messages({
      'any.only': 'Invalid sort field.'
    }),
  sortOrder: Joi.string()
    .optional()
    .default('desc')
    .valid('asc', 'desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc.'
    })
});

// Schema for credit limit update
exports.creditLimitSchema = Joi.object({
  creditLimit: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.base': 'Credit limit must be a number.',
      'number.min': 'Credit limit cannot be negative.',
      'any.required': 'Credit limit is required.'
    }),
  reason: Joi.string()
    .required()
    .min(5)
    .max(500)
    .trim()
    .messages({
      'string.empty': 'Reason is required.',
      'string.min': 'Reason must be at least 5 characters.',
      'string.max': 'Reason must not exceed 500 characters.'
    })
});
