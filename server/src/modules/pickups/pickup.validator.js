const Joi = require('joi');
const { PICKUP_STATUS } = require('../../shared/constants/status');

const addressSchema = Joi.object({
  line1:   Joi.string().required(),
  line2:   Joi.string().optional(),
  city:    Joi.string().required(),
  state:   Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
});

exports.createSchema = Joi.object({
  customer:   Joi.string().hex().length(24).required().messages({
    'string.hex':    'customer must be a valid MongoDB ObjectId.',
    'string.length': 'customer must be a valid MongoDB ObjectId.',
  }),
  pickupDate: Joi.date().min('now').required(),
  pickupTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'pickupTime must be in HH:MM format.',
  }),
  address: addressSchema.required(),
  notes:   Joi.string().max(500).optional(),
});

exports.assignSchema = Joi.object({
  agentId: Joi.string().hex().length(24).required(),
});

exports.statusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(PICKUP_STATUS)).required(),
  note:   Joi.string().max(300).optional(),
});

exports.updateSchema = Joi.object({
  pickupDate: Joi.date().min('now'),
  pickupTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  address:    addressSchema,
  notes:      Joi.string().max(500),
}).min(1);
