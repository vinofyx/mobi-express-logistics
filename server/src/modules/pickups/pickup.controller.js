const Pickup   = require("./pickup.model");
const Customer = require("../customers/customer.model");

// LIST ALL PICKUPS
exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.agent)  filter.assignedAgent = req.query.agent;

    const pickups = await Pickup.find(filter)
      .populate("customer", "name phone type")
      .populate("assignedAgent", "name phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: pickups });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE PICKUP
exports.create = async (req, res) => {
  try {
    const {
      customer, pickupAddress, scheduledDate, pickupTime,
      deliveryType, parcelType, notes, assignedAgent,
    } = req.body;

    if (!customer || !scheduledDate || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: "customer, scheduledDate, and pickupAddress are required.",
      });
    }
    if (!pickupAddress.line1 || !pickupAddress.city || !pickupAddress.state || !pickupAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: "pickupAddress must include line1, city, state, and pincode.",
      });
    }

    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const pickup = await Pickup.create({
      customer,
      pickupAddress,
      scheduledDate:  new Date(scheduledDate),
      pickupTime:     pickupTime || "09:00",
      deliveryType:   deliveryType || "standard",
      parcelType:     parcelType   || "parcel",
      assignedAgent:  assignedAgent || null,
      notes:          notes || "",
      status:         "Requested",
      statusHistory:  [{ status: "Requested", note: "Pickup created." }],
    });

    return res.status(201).json({
      success: true,
      message: "Pickup created successfully.",
      data: { pickup },
    });
  } catch (err) {
    console.error("CREATE PICKUP ERROR:", err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ success: false, message: errors[0] || "Validation failed.", errors });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    return res.status(500).json({ success: false, message: err.message || "Server error." });
  }
};

// GET ONE PICKUP
exports.getOne = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate("customer", "name phone type address")
      .populate("assignedAgent", "name phone");
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found." });
    return res.json({ success: true, data: { pickup } });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ success: false, message: "Invalid ID." });
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE PICKUP
exports.update = async (req, res) => {
  try {
    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("customer", "name phone");
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found." });
    return res.json({ success: true, message: "Pickup updated.", data: { pickup } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ASSIGN AGENT
exports.assign = async (req, res) => {
  try {
    const { agentId } = req.body;
    if (!agentId) return res.status(400).json({ success: false, message: "agentId is required." });

    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      {
        assignedAgent: agentId,
        status: "Assigned",
        $push: { statusHistory: { status: "Assigned", note: "Assigned to agent." } },
      },
      { new: true }
    ).populate("customer", "name phone").populate("assignedAgent", "name phone");
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found." });
    return res.json({ success: true, message: "Agent assigned.", data: { pickup } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "status is required." });

    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, note: note || `Status changed to ${status}.` } },
      },
      { new: true, runValidators: true }
    ).populate("customer", "name phone");
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found." });
    return res.json({ success: true, message: "Status updated.", data: { pickup } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE PICKUP
exports.remove = async (req, res) => {
  try {
    const pickup = await Pickup.findByIdAndDelete(req.params.id);
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found." });
    return res.json({ success: true, message: "Pickup deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
