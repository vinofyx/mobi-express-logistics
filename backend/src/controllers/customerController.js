const Customer = require("../models/Customer");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customers/create
// ─────────────────────────────────────────────────────────────────────────────
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, address, gst } = req.body;

    // Duplicate phone check (schema has unique:true but we give a friendly message)
    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A customer with this phone number already exists.",
      });
    }

    const customer = await Customer.create({ name, phone, address, gst });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: { customer },
    });
  } catch (err) {
    // Mongoose validation errors → 422
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ success: false, message: "Validation failed.", errors });
    }
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers
// Query params: ?page=1&limit=10&search=<name or phone>
// ─────────────────────────────────────────────────────────────────────────────
exports.getCustomers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  ?? 1,  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? 10, 10)));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name:  new RegExp(req.query.search, "i") },
        { phone: new RegExp(req.query.search, "i") },
      ];
    }

    const [total, customers] = await Promise.all([
      Customer.countDocuments(filter),
      Customer.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Customers retrieved.",
      data: { customers },
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
