const Joi = require('joi');

const addressSchema = Joi.object({
  line1:   Joi.string().required(),
  line2:   Joi.string().optional(),
  city:    Joi.string().required(),
  state:   Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'PIN code must be exactly 6 digits.',
  }),
});

exports.createSchema = Joi.object({
  name:    Joi.string().min(2).max(150).required(),
  phone:   Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number.',
  }),
  email:   Joi.string().email().optional(),
  address: addressSchema.required(),
  gst:     Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Invalid GST number format.' }),
});

exports.updateSchema = Joi.object({
  name:    Joi.string().min(2).max(150),
  phone:   Joi.string().pattern(/^[6-9]\d{9}$/),
  email:   Joi.string().email(),
  address: addressSchema,
  gst:     Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
}).min(1).messages({ 'object.min': 'Provide at least one field to update.' });
