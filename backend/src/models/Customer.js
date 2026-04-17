const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required."],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."],
    },

    address: {
      street: { type: String, required: [true, "Street is required."] },
      city:   { type: String, required: [true, "City is required."] },
      state:  { type: String, required: [true, "State is required."] },
      pincode: {
        type: String,
        required: [true, "Pincode is required."],
        match: [/^\d{6}$/, "Pincode must be exactly 6 digits."],
      },
    },

    gst: {
      type: String,
      default: null,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST number format.",
      ],
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model("Customer", customerSchema);
