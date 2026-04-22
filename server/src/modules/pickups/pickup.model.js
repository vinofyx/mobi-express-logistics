// D:\MobiExpress\backend\src\modules\pickups\pickup.model.js
const mongoose = require('mongoose');

const statusEntrySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const pickupSchema = new mongoose.Schema({
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  pickupAddress: {
    line1:   { type: String, required: true },
    line2:   { type: String },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },
  deliveryType:   { type: String, enum: ['standard', 'express', 'same_day'], default: 'standard' },
  parcelType:     { type: String, enum: ['document', 'parcel', 'fragile', 'electronics', 'bulk'], default: 'parcel' },
  scheduledDate:  { type: Date, required: true },
  pickupTime:     { type: String, default: '09:00' },
  assignedAgent:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Requested', 'Assigned', 'Picked', 'Failed'],
    default: 'Requested',
  },
  statusHistory:  [statusEntrySchema],
  notes:          { type: String },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingId:     { type: String, unique: true, default: () => `PK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
}, { timestamps: true });

pickupSchema.index({ customer: 1, status: 1 });
pickupSchema.index({ assignedAgent: 1, scheduledDate: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);