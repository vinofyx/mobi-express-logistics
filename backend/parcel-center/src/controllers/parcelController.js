const Parcel = require("../models/Parcel");
const parcelService = require("../services/parcelService");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/parcels/create
// ─────────────────────────────────────────────────────────────────────────────
exports.createParcel = async (req, res) => {
  try {
    const {
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      pickupAddress,
      destinationAddress,
      description,
      weight,
      dimensions,
      priority,
    } = req.body;

    const centerCode = process.env.CENTER_CODE || "HYD";

    const parcel = await Parcel.create({
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      pickupAddress,
      destinationAddress,
      description,
      weight,
      dimensions,
      priority,
      centerCode,
    });

    return res.status(201).json({
      success: true,
      message: "Parcel created successfully.",
      data: { parcel },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ success: false, message: "Validation failed.", errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate tracking ID detected." });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parcels
// Query params: status, destination, priority, isDamaged, sortBy, order, page, limit
// ─────────────────────────────────────────────────────────────────────────────
exports.getParcels = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? 20, 10)));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.destination) {
      filter["destinationAddress.city"] = new RegExp(req.query.destination, "i");
    }
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.isDamaged !== undefined) filter.isDamaged = req.query.isDamaged === "true";

    // Build sort
    let sort = {};
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    sort[sortBy] = order;

    const [total, parcels] = await Promise.all([
      Parcel.countDocuments(filter),
      Parcel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-__v"),
    ]);

    return res.status(200).json({
      success: true,
      message: "Parcels retrieved.",
      data: { parcels },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parcels/sort-view
// Returns parcels grouped by destination, sorted by priority within each group
// ─────────────────────────────────────────────────────────────────────────────
exports.getSortedView = async (req, res) => {
  try {
    const parcels = await Parcel.find({ status: { $ne: "Dispatched" } })
      .sort({ priority: -1, createdAt: 1 })
      .select("trackingId destinationAddress priority status createdAt");

    // Group by destination city
    const grouped = parcels.reduce((acc, parcel) => {
      const city = parcel.destinationAddress.city;
      if (!acc[city]) acc[city] = [];
      acc[city].push(parcel);
      return acc;
    }, {});

    // Sort each group by priority (Urgent -> Express -> Standard)
    const priorityOrder = { Urgent: 0, Express: 1, Standard: 2 };
    Object.keys(grouped).forEach((city) => {
      grouped[city].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    });

    return res.status(200).json({
      success: true,
      message: "Sorted view retrieved.",
      data: { grouped },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parcels/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Parcel retrieved.",
      data: { parcel },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid parcel ID." });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parcels/tracking/:trackingId
// ─────────────────────────────────────────────────────────────────────────────
exports.getParcelByTrackingId = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ trackingId: req.params.trackingId.toUpperCase() });
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found with this tracking ID." });
    }

    return res.status(200).json({
      success: true,
      message: "Parcel retrieved by tracking ID.",
      data: { parcel },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/parcels/:id/status
// State machine enforced status transitions
// ─────────────────────────────────────────────────────────────────────────────
exports.updateParcelStatus = async (req, res) => {
  try {
    const { status, note, updatedBy } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found." });
    }

    // State machine validation
    if (!parcel.canTransitionTo(status)) {
      const allowed = parcel.getAllowedTransitions();
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${parcel.status}' to '${status}'. Allowed: [${allowed.join(", ") || "none"}]`,
      });
    }

    // Block damage marking on dispatched parcels
    if (parcel.status === "Dispatched" && (req.body.isDamaged || req.body.damageDescription)) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark dispatched parcels as damaged.",
      });
    }

    // Update status and add to history
    parcel.status = status;
    parcel.addStatusHistory(status, note, updatedBy);

    await parcel.save();

    return res.status(200).json({
      success: true,
      message: `Parcel status updated to '${status}'.`,
      data: { parcel },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid parcel ID." });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/parcels/:id/damage
// Mark parcel as damaged or missing (blocked on Dispatched status)
// ─────────────────────────────────────────────────────────────────────────────
exports.markParcelDamage = async (req, res) => {
  try {
    const { isDamaged, damageDescription, updatedBy } = req.body;

    if (typeof isDamaged !== "boolean") {
      return res.status(400).json({ success: false, message: "isDamaged must be a boolean." });
    }

    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found." });
    }

    // Block damage marking on dispatched parcels
    if (parcel.status === "Dispatched") {
      return res.status(400).json({
        success: false,
        message: "Cannot mark dispatched parcels as damaged.",
      });
    }

    parcel.isDamaged = isDamaged;
    parcel.damageDescription = isDamaged ? damageDescription : null;

    if (isDamaged) {
      parcel.addStatusHistory(
        parcel.status,
        `Parcel marked as damaged: ${damageDescription || "No description provided"}`,
        updatedBy
      );
    }

    await parcel.save();

    return res.status(200).json({
      success: true,
      message: `Parcel ${isDamaged ? "marked as damaged" : "damage status cleared"}.`,
      data: { parcel },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid parcel ID." });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/parcels/from-pickup
// Create parcel from pickup data
// ─────────────────────────────────────────────────────────────────────────────
exports.createFromPickup = async (req, res) => {
  try {
    const { pickupId, customerId, senderName, senderPhone, recipientName, recipientPhone, pickupAddress, destinationAddress, description, weight, dimensions } = req.body;

    // Create a mock pickup object for service
    const pickup = {
      _id: pickupId,
      customerId: { _id: customerId },
      recipientName,
      recipientPhone,
      pickupAddress,
      destinationAddress,
      description,
      weight,
      dimensions
    };

    const result = await parcelService.autoCreateFromPickup(pickup);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to create parcel from pickup.",
        error: result.error
      });
    }

    const statusCode = result.alreadyExisted ? 200 : 201;
    const message = result.alreadyExisted ? 
      "Parcel already exists for this pickup." : 
      "Parcel created successfully from pickup.";

    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        parcel: result.parcel,
        alreadyExisted: result.alreadyExisted
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parcels/constants
// Return available statuses, priorities, and transitions
// ─────────────────────────────────────────────────────────────────────────────
exports.getConstants = async (req, res) => {
  try {
    const constants = Parcel.getConstants();
    return res.status(200).json({
      success: true,
      message: "Constants retrieved.",
      data: constants,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};
