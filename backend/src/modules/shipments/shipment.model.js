const mongoose = require('mongoose');
const { SHIPMENT_STATUS } = require('../../shared/constants/status');

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

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type:   String,
      unique: true,
      // generated in pre-validate hook
    },
    parcels: [
      {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'Parcel',
        required: true,
      },
    ],
    originHub:      { type: String, required: [true, 'Origin hub is required.'] },
    destinationHub: { type: String, required: [true, 'Destination hub is required.'] },
    route:          [{ type: String }], // intermediate hub names
    status: {
      type:    String,
      enum:    Object.values(SHIPMENT_STATUS),
      default: SHIPMENT_STATUS.DISPATCHED,
    },
    statusHistory:  [statusEntrySchema],
    dispatchedAt:   { type: Date },
    expectedArrival:{ type: Date },
    receivedAt:     { type: Date },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// ─── Auto-generate shipment ID ─────────────────────────────────────────────────
shipmentSchema.pre('validate', function (next) {
  if (!this.shipmentId) {
    const ts  = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.shipmentId = `SHP-${ts}-${rnd}`;
  }
  next();
});

shipmentSchema.index({ status: 1, originHub: 1 });
shipmentSchema.index({ shipmentId: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
