const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    line1:    { type: String, required: true },
    line2:    { type: String },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true, match: [/^\d{6}$/, 'Invalid PIN code.'] },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Customer name is required.'],
      trim:      true,
      maxlength: [150, 'Name must not exceed 150 characters.'],
    },
    phone: {
      type:     String,
      required: [true, 'Phone number is required.'],
      match:    [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number.'],
    },
    email: {
      type:      String,
      lowercase: true,
      trim:      true,
      sparse:    true,
    },
    address:  { type: addressSchema, required: true },
    gst:      {
      type:  String,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number.'],
    },
    isActive:  { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

customerSchema.index({ name: 'text', phone: 1 });

module.exports = mongoose.model('Customer', customerSchema);
