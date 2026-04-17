const Joi = require('joi');
const { ROLES } = require('../../config/roles');

exports.registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role:     Joi.string().valid(...Object.values(ROLES)).optional(),
});

exports.loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});
