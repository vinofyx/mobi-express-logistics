const mongoose = require('mongoose');
const { PICKUP_STATUS } = require('../../shared/constants/status');

const statusEntrySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const pickupSchema = new mongoose.Schema(
  {
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Customer',
      required: [true, 'Customer is required.'],
    },
    pickupDate: {
      type:     Date,
      required: [true, 'Pickup date is required.'],
    },
    pickupTime: {
      type:     String,
      required: [true, 'Pickup time slot is required.'],
      match:    [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format.'],
    },
    address: {
      line1:   { type: String, required: true },
      line2:   { type: String },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    status: {
      type:    String,
      enum:    Object.values(PICKUP_STATUS),
      default: PICKUP_STATUS.REQUESTED,
    },
    statusHistory: [statusEntrySchema],
    parcels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parcel' }],
    notes:   { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

pickupSchema.index({ customer: 1, status: 1 });
pickupSchema.index({ assignedAgent: 1, pickupDate: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);
