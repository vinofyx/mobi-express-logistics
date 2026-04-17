const Customer    = require('./customer.model');
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');
const paginate    = require('../../shared/utils/paginate');

// ─── Create ───────────────────────────────────────────────────────────────────

exports.create = catchAsync(async (req, res) => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
  return apiResponse(res, 201, 'Customer created.', { customer });
});

// ─── List ─────────────────────────────────────────────────────────────────────

exports.list = catchAsync(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.search) {
    filter.$or = [
      { name:  new RegExp(req.query.search, 'i') },
      { phone: new RegExp(req.query.search, 'i') },
    ];
  }

  const result = await paginate(Customer, filter, req.query, ['createdBy']);
  return apiResponse(res, 200, 'Customers retrieved.', result.data, result.meta);
});

// ─── Get one ─────────────────────────────────────────────────────────────────

exports.getOne = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');
  if (!customer) return apiResponse(res, 404, 'Customer not found.');
  return apiResponse(res, 200, 'Customer retrieved.', { customer });
});

// ─── Update ───────────────────────────────────────────────────────────────────

exports.update = catchAsync(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!customer) return apiResponse(res, 404, 'Customer not found.');
  return apiResponse(res, 200, 'Customer updated.', { customer });
});

// ─── Soft delete ──────────────────────────────────────────────────────────────

exports.remove = catchAsync(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!customer) return apiResponse(res, 404, 'Customer not found.');
  return apiResponse(res, 200, 'Customer deactivated.');
});
