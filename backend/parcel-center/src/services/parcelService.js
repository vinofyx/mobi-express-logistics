const Parcel = require("../models/Parcel");

// ─────────────────────────────────────────────────────────────────────────────
// Auto-create parcel from pickup when status changes to "Picked"
// ─────────────────────────────────────────────────────────────────────────────
exports.autoCreateFromPickup = async (pickup) => {
  try {
    // Check if parcel already exists for this pickup
    const existingParcel = await Parcel.findOne({ pickupId: pickup._id });
    if (existingParcel) {
      return {
        success: true,
        parcel: existingParcel,
        alreadyExisted: true
      };
    }

    // Create new parcel from pickup data
    const parcel = await Parcel.create({
      pickupId: pickup._id,
      customerId: pickup.customerId,
      status: "Picked",
      // Generate tracking ID using center code from environment
      trackingId: generateTrackingId(process.env.CENTER_CODE || "CTR"),
      
      // Map pickup fields to parcel fields
      senderName: pickup.customer?.name || "Unknown Sender",
      senderPhone: pickup.customer?.phone || "",
      recipientName: pickup.recipientName || "Unknown Recipient", 
      recipientPhone: pickup.recipientPhone || "",
      
      pickupAddress: pickup.pickupAddress || {
        street: "",
        city: "",
        state: "",
        pincode: ""
      },
      
      destinationAddress: pickup.destinationAddress || {
        street: "",
        city: "",
        state: "",
        pincode: ""
      },
      
      description: pickup.description || "Package from pickup",
      weight: pickup.weight || 1,
      dimensions: pickup.dimensions || { length: 10, width: 10, height: 10 },
      
      centerCode: process.env.CENTER_CODE || "CTR"
    });

    return {
      success: true,
      parcel,
      alreadyExisted: false
    };
  } catch (error) {
    console.error("Error creating parcel from pickup:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate tracking ID: LMS-{CENTER_CODE}-{YYYYMMDD}-{epoch_base36}-{random}
// ─────────────────────────────────────────────────────────────────────────────
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
