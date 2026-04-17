const mongoose = require("mongoose");

// ── Constants ─────────────────────────────────────────────────────────────────────
const PARCEL_STATUSES = {
  PICKED: "Picked",
  RECEIVED_AT_CENTER: "Received at Center",
  SORTED: "Sorted",
  DISPATCHED: "Dispatched",
};

const PRIORITIES = {
  URGENT: "Urgent",
  EXPRESS: "Express",
  STANDARD: "Standard",
};

// State machine transitions - what's allowed next
const STATUS_TRANSITIONS = {
  [PARCEL_STATUSES.PICKED]: [PARCEL_STATUSES.RECEIVED_AT_CENTER],
  [PARCEL_STATUSES.RECEIVED_AT_CENTER]: [PARCEL_STATUSES.SORTED],
  [PARCEL_STATUSES.SORTED]: [PARCEL_STATUSES.DISPATCHED],
  [PARCEL_STATUSES.DISPATCHED]: [], // Terminal state
};

// ── Status History Schema ───────────────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, trim: true, maxlength: 200 },
    updatedBy: { type: String, trim: true },
  },
  { _id: false }
);

// ── Parcel Schema ─────────────────────────────────────────────────────────────
const parcelSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: [/^LMS-[A-Z]{3}-\d{8}-[A-Z0-9]{4}-[A-Z0-9]{3}$/, "Invalid tracking ID format"],
    },

    // Integration fields
    pickupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickup",
      required: [true, "Pickup ID is required"],
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },

    // Sender information
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
      maxlength: [100, "Sender name cannot exceed 100 characters"],
    },

    senderPhone: {
      type: String,
      required: [true, "Sender phone is required"],
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },

    // Recipient information
    recipientName: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
      maxlength: [100, "Recipient name cannot exceed 100 characters"],
    },

    recipientPhone: {
      type: String,
      required: [true, "Recipient phone is required"],
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },

    // Address information
    pickupAddress: {
      street: { type: String, required: [true, "Pickup street is required"] },
      city: { type: String, required: [true, "Pickup city is required"] },
      state: { type: String, required: [true, "Pickup state is required"] },
      pincode: {
        type: String,
        required: [true, "Pickup pincode is required"],
        match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
      },
    },

    destinationAddress: {
      street: { type: String, required: [true, "Destination street is required"] },
      city: { type: String, required: [true, "Destination city is required"] },
      state: { type: String, required: [true, "Destination state is required"] },
      pincode: {
        type: String,
        required: [true, "Destination pincode is required"],
        match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
      },
    },

    // Package details
    description: {
      type: String,
      required: [true, "Package description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0.1, "Weight must be greater than 0"],
      max: [50, "Weight cannot exceed 50 kg"],
    },

    dimensions: {
      length: { type: Number, required: [true, "Length is required"], min: [1, "Length must be greater than 0"] },
      width: { type: Number, required: [true, "Width is required"], min: [1, "Width must be greater than 0"] },
      height: { type: Number, required: [true, "Height is required"], min: [1, "Height must be greater than 0"] },
    },

    // Priority and status
    priority: {
      type: String,
      enum: {
        values: Object.values(PRIORITIES),
        message: `Priority must be one of: ${Object.values(PRIORITIES).join(", ")}`,
      },
      default: PRIORITIES.STANDARD,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(PARCEL_STATUSES),
        message: `Status must be one of: ${Object.values(PARCEL_STATUSES).join(", ")}`,
      },
      default: PARCEL_STATUSES.PICKED,
    },

    // Damage tracking
    isDamaged: {
      type: Boolean,
      default: false,
    },

    damageDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Damage description cannot exceed 300 characters"],
    },

    // Audit trail
    statusHistory: [statusHistorySchema],

    // Center information
    centerCode: {
      type: String,
      required: [true, "Center code is required"],
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ destinationAddress: 1 });
parcelSchema.index({ priority: 1 });
parcelSchema.index({ centerCode: 1 });
parcelSchema.index({ createdAt: -1 });

// ── Pre-save hook for tracking ID generation ─────────────────────────────────
parcelSchema.pre("save", async function (next) {
  if (this.isNew && !this.trackingId) {
    this.trackingId = generateTrackingId(this.centerCode);
  }

  // Add initial status to history if it's a new parcel
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      note: "Parcel picked up from sender",
    });
  }

  next();
});

// ── Tracking ID Generator ───────────────────────────────────────────────────────
function generateTrackingId(centerCode) {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  
  // Last 4 digits of epoch time in base-36 (monotonic within day)
  const epochSeconds = Math.floor(date.getTime() / 1000);
  const epochBase36 = epochSeconds.toString(36).slice(-4).toUpperCase().padStart(4, '0');
  
  // 3 random characters for collision buffer
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `LMS-${centerCode}-${dateStr}-${epochBase36}-${randomChars}`;
}

// ── Instance Methods ───────────────────────────────────────────────────────────
parcelSchema.methods.canTransitionTo = function (newStatus) {
  const allowedTransitions = STATUS_TRANSITIONS[this.status] || [];
  return allowedTransitions.includes(newStatus);
};

parcelSchema.methods.getAllowedTransitions = function () {
  return STATUS_TRANSITIONS[this.status] || [];
};

parcelSchema.methods.addStatusHistory = function (status, note, updatedBy) {
  this.statusHistory.push({
    status,
    note: note || `Status changed to ${status}`,
    updatedBy: updatedBy || "system",
    timestamp: new Date(),
  });
};

// ── Static Methods ─────────────────────────────────────────────────────────────
parcelSchema.statics.getConstants = function () {
  return {
    statuses: PARCEL_STATUSES,
    priorities: PRIORITIES,
    transitions: STATUS_TRANSITIONS,
  };
};

module.exports = mongoose.model("Parcel", parcelSchema);
