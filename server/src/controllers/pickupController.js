const Pickup   = require("../models/Pickup");
const Customer = require("../modules/customers/customer.model");

// Valid status transitions — prevents illogical jumps
const TRANSITIONS = {
  Requested: ["Assigned", "Failed"],
  Assigned:  ["Picked",   "Failed"],
  Picked:    [],                      // terminal
  Failed:    ["Requested"],           // allow retry
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/pickups/create
// ─────────────────────────────────────────────────────────────────────────────
exports.createPickup = async (req, res) => {
  try {
    const { customerId, pickupDate, pickupTime, assignedAgent } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    // pickupDate must be today or in the future
    const date = new Date(pickupDate);
    if (isNaN(date.getTime()) || date < new Date(new Date().toDateString())) {
      return res.status(400).json({
        success: false,
        message: "pickupDate must be today or a future date.",
      });
    }

    const pickup = await Pickup.create({
      customerId,
      pickupDate: date,
      pickupTime,
      assignedAgent: assignedAgent || null,
      status:        "Requested",
      statusLog:     [{ status: "Requested", note: "Pickup request created." }],
    });

    return res.status(201).json({
      success: true,
      message: "Pickup request created.",
      data:    { pickup },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ success: false, message: "Validation failed.", errors });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid customerId format." });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pickups
// Query params: ?page=1&limit=10&status=Assigned&customerId=<id>&date=YYYY-MM-DD
// ─────────────────────────────────────────────────────────────────────────────
exports.getPickups = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  ?? 1,  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? 10, 10)));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status)     filter.status     = req.query.status;
    if (req.query.customerId) filter.customerId  = req.query.customerId;
    if (req.query.date) {
      const day = new Date(req.query.date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      filter.pickupDate = { $gte: day, $lt: nextDay };
    }

    const [total, pickups] = await Promise.all([
      Pickup.countDocuments(filter),
      Pickup.find(filter)
        .populate("customerId", "name phone address") // join customer details
        .skip(skip)
        .limit(limit)
        .sort({ pickupDate: 1, pickupTime: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Pickups retrieved.",
      data:    { pickups },
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
// PUT /api/pickups/:id/status
// Body: { status, assignedAgent?, note? }
// ─────────────────────────────────────────────────────────────────────────────
exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedAgent, note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required." });
    }

    const pickup = await Pickup.findById(id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found." });
    }

    // Enforce state-machine transitions
    const allowed = TRANSITIONS[pickup.status] ?? [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move from '${pickup.status}' to '${status}'. Allowed: [${allowed.join(", ") || "none"}]`,
      });
    }

    // Update fields
    pickup.status = status;
    if (assignedAgent !== undefined) pickup.assignedAgent = assignedAgent;
    pickup.statusLog.push({
      status,
      changedAt: new Date(),
      note: note || `Status changed to ${status}.`,
    });

    await pickup.save();

    return res.status(200).json({
      success: true,
      message: `Pickup status updated to '${status}'.`,
      data:    { pickup },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pickup ID." });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};
