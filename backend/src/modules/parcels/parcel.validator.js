const Joi = require('joi');
const { PARCEL_STATUS } = require('../../shared/constants/status');

exports.addSchema = Joi.object({
  customer:      Joi.string().hex().length(24).required(),
  pickup:        Joi.string().hex().length(24).optional(),
  weight:        Joi.number().min(0.1).required(),
  dimensions: Joi.object({
    length: Joi.number().min(1),
    width:  Joi.number().min(1),
    height: Joi.number().min(1),
  }).optional(),
  type:          Joi.string().valid('Document', 'Parcel', 'Fragile', 'Perishable', 'Electronics').optional(),
  quantity:      Joi.number().integer().min(1).optional(),
  declaredValue: Joi.number().min(0).optional(),
});

exports.updateSchema = Joi.object({
  weight:        Joi.number().min(0.1),
  dimensions: Joi.object({
    length: Joi.number().min(1),
    width:  Joi.number().min(1),
    height: Joi.number().min(1),
  }),
  type:          Joi.string().valid('Document', 'Parcel', 'Fragile', 'Perishable', 'Electronics'),
  quantity:      Joi.number().integer().min(1),
  declaredValue: Joi.number().min(0),
}).min(1);

exports.statusSchema = Joi.object({
  status:   Joi.string().valid(...Object.values(PARCEL_STATUS)).required(),
  note:     Joi.string().max(300).optional(),
  location: Joi.string().max(200).optional(),
});
