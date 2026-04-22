const mongoose = require("mongoose");

const PICKUP_STATUSES = ["Requested", "Assigned", "Picked", "Failed"];

const statusLogSchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    changedAt: { type: Date,   default: Date.now },
    note:      { type: String, default: "" },
  },
  { _id: false }
);

const pickupSchema = new mongoose.Schema(
  {
    customerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Customer",
      required: [true, "Customer ID is required."],
    },

    pickupDate: {
      type:     Date,
      required: [true, "Pickup date is required."],
    },

    pickupTime: {
      type:     String,
      required: [true, "Pickup time is required."],
      match:    [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format (24hr)."],
    },

    assignedAgent: {
      type:    String,   // agent name or ID string; swap to ObjectId ref if agents are Users
      default: null,
    },

    status: {
      type:    String,
      enum:    {
        values:  PICKUP_STATUSES,
        message: `Status must be one of: ${PICKUP_STATUSES.join(", ")}`,
      },
      default: "Requested",
    },

    // Full audit trail of every status change
    statusLog: [statusLogSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
pickupSchema.index({ customerId: 1, status: 1 });
pickupSchema.index({ pickupDate: 1 });

module.exports = mongoose.model("Pickup", pickupSchema);
