const Joi = require('joi');
const { SHIPMENT_STATUS } = require('../../shared/constants/status');

const objectId = Joi.string().hex().length(24);

exports.createSchema = Joi.object({
  parcelIds:       Joi.array().items(objectId).min(1).required(),
  originHub:       Joi.string().required(),
  destinationHub:  Joi.string().required(),
  route:           Joi.array().items(Joi.string()).optional(),
  expectedArrival: Joi.date().greater('now').optional(),
});

exports.assignParcelsSchema = Joi.object({
  parcelIds: Joi.array().items(objectId).min(1).required(),
});

exports.statusSchema = Joi.object({
  status:   Joi.string().valid(...Object.values(SHIPMENT_STATUS)).required(),
  note:     Joi.string().max(300).optional(),
  location: Joi.string().max(200).optional(),
});
