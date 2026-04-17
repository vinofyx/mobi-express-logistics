const User        = require('./user.model');
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');
const paginate    = require('../../shared/utils/paginate');
const { ROLES }   = require('../../config/roles');

// ─── List all users ───────────────────────────────────────────────────────────

exports.list = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.role)     filter.role     = req.query.role;
  if (req.query.isActive) filter.isActive = req.query.isActive === 'true';

  const result = await paginate(User, filter, req.query);
  return apiResponse(res, 200, 'Users retrieved.', result.data, result.meta);
});

// ─── Get one user ─────────────────────────────────────────────────────────────

exports.getOne = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return apiResponse(res, 404, 'User not found.');
  return apiResponse(res, 200, 'User retrieved.', { user });
});

// ─── Update user ──────────────────────────────────────────────────────────────

exports.update = catchAsync(async (req, res) => {
  // Prevent password change through this route; use a dedicated endpoint
  delete req.body.password;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!user) return apiResponse(res, 404, 'User not found.');
  return apiResponse(res, 200, 'User updated.', { user });
});

// ─── Change role ──────────────────────────────────────────────────────────────

exports.changeRole = catchAsync(async (req, res) => {
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    return apiResponse(res, 400, `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  );
  if (!user) return apiResponse(res, 404, 'User not found.');
  return apiResponse(res, 200, 'User role updated.', { user });
});

// ─── Deactivate / activate ────────────────────────────────────────────────────

exports.toggleActive = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return apiResponse(res, 404, 'User not found.');

  user.isActive = !user.isActive;
  await user.save();

  const action = user.isActive ? 'activated' : 'deactivated';
  return apiResponse(res, 200, `User ${action}.`, { user });
});

// ─── Get logged-in user profile ────────────────────────────────────────────────

exports.getMe = catchAsync(async (req, res) => {
  return apiResponse(res, 200, 'Profile retrieved.', { user: req.user });
});
