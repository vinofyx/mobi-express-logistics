const mongoose = require('mongoose');
const { PARCEL_STATUS } = require('../../shared/constants/status');

const statusEntrySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    location:  { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const parcelSchema = new mongoose.Schema(
  {
    trackingId: {
      type:   String,
      unique: true,
      // generated in pre-validate hook
    },
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Customer',
      required: [true, 'Customer reference is required.'],
    },
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Pickup',
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Shipment',
    },
    weight: {
      type:     Number,
      required: [true, 'Weight (in kg) is required.'],
      min:      [0.1, 'Weight must be at least 0.1 kg.'],
    },
    dimensions: {
      length: { type: Number }, // cm
      width:  { type: Number },
      height: { type: Number },
    },
    type: {
      type:     String,
      enum:     ['Document', 'Parcel', 'Fragile', 'Perishable', 'Electronics'],
      default:  'Parcel',
    },
    quantity: {
      type:    Number,
      default: 1,
      min:     [1, 'Quantity must be at least 1.'],
    },
    declaredValue: { type: Number },
    status: {
      type:    String,
      enum:    Object.values(PARCEL_STATUS),
      default: PARCEL_STATUS.PENDING,
    },
    statusHistory: [statusEntrySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// ─── Auto-generate tracking ID before first save ───────────────────────────────
parcelSchema.pre('validate', function (next) {
  if (!this.trackingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random    = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingId = `LMS-${timestamp}-${random}`;
  }
  next();
});

parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ customer: 1, status: 1 });
parcelSchema.index({ shipment: 1 });

module.exports = mongoose.model('Parcel', parcelSchema);
