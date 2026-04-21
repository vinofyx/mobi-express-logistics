const Pickup      = require('./pickup.model');
const User        = require('../users/user.model');
const Parcel      = require('../parcels/parcel.model'); // ✅ ADDED
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');
const paginate    = require('../../shared/utils/paginate');
const { PICKUP_STATUS } = require('../../shared/constants/status');
const { ROLES } = require('../../config/roles');

// ─── Status transition rules ───────────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  [PICKUP_STATUS.REQUESTED]: [PICKUP_STATUS.ASSIGNED, PICKUP_STATUS.FAILED],
  [PICKUP_STATUS.ASSIGNED]:  [PICKUP_STATUS.PICKED,   PICKUP_STATUS.FAILED],
  [PICKUP_STATUS.PICKED]:    [],
  [PICKUP_STATUS.FAILED]:    [PICKUP_STATUS.REQUESTED],
};

// ─── Create ───────────────────────────────────────────────────────────────────
exports.create = catchAsync(async (req, res) => {
  const pickup = await Pickup.create({
    ...req.body,
    createdBy:     req.user?._id,
    statusHistory: [{ status: PICKUP_STATUS.REQUESTED, updatedBy: req.user?._id }],
  });
  return apiResponse(res, 201, 'Pickup request created.', { pickup });
});

// ─── List ─────────────────────────────────────────────────────────────────────
exports.list = catchAsync(async (req, res) => {
  const filter = {};

  if (req.user?.role === ROLES.FIELD_AGENT) {
    filter.assignedAgent = req.user._id;
  }
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.date)     filter.pickupDate = new Date(req.query.date);

  const result = await paginate(
    Pickup,
    filter,
    req.query,
    [
      { path: 'customer',      select: 'name phone address' },
      { path: 'assignedAgent', select: 'name email' },
      { path: 'createdBy',     select: 'name' },
    ],
  );
  return apiResponse(res, 200, 'Pickups retrieved.', result.data, result.meta);
});

// ─── Get one ─────────────────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id)
    .populate('customer',      'name phone address')
    .populate('assignedAgent', 'name email phone')
    .populate('parcels',       'trackingId status weight')
    .populate('createdBy',     'name');

  if (!pickup) return apiResponse(res, 404, 'Pickup not found.');
  return apiResponse(res, 200, 'Pickup retrieved.', { pickup });
});

// ─── Assign to field agent ────────────────────────────────────────────────────
exports.assign = catchAsync(async (req, res) => {
  const { agentId } = req.body;

  const agent = await User.findById(agentId);
  if (!agent || agent.role !== ROLES.FIELD_AGENT) {
    return apiResponse(res, 400, 'Provided user is not a valid field agent.');
  }

  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return apiResponse(res, 404, 'Pickup not found.');

  if (pickup.status !== PICKUP_STATUS.REQUESTED) {
    return apiResponse(res, 400, `Cannot assign a pickup in '${pickup.status}' status.`);
  }

  pickup.assignedAgent = agentId;
  pickup.status        = PICKUP_STATUS.ASSIGNED;
  pickup.statusHistory.push({ status: PICKUP_STATUS.ASSIGNED, updatedBy: req.user?._id });
  await pickup.save();

  return apiResponse(res, 200, 'Pickup assigned to field agent.', { pickup });
});

// ─── Update status (🔥 WITH PARCEL CREATION) ───────────────────────────────────
exports.updateStatus = catchAsync(async (req, res) => {
  const { status, note } = req.body;

  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return apiResponse(res, 404, 'Pickup not found.');

  const allowed = ALLOWED_TRANSITIONS[pickup.status] ?? [];
  if (!allowed.includes(status)) {
    return apiResponse(
      res,
      400,
      `Cannot transition from '${pickup.status}' to '${status}'.`,
    );
  }

  // Field agents restriction
  if (
    req.user.role === ROLES.FIELD_AGENT &&
    ![PICKUP_STATUS.PICKED, PICKUP_STATUS.FAILED].includes(status)
  ) {
    return apiResponse(res, 403, 'Field agents may only mark pickups as Picked or Failed.');
  }

  // Update pickup
  pickup.status = status;
  pickup.statusHistory.push({ status, updatedBy: req.user._id, note });
  await pickup.save();

  // 🔥 AUTO CREATE PARCEL
  if (status === PICKUP_STATUS.PICKED) {

    // prevent duplicate parcel
    const existingParcel = await Parcel.findOne({ pickupId: pickup._id });

    if (!existingParcel) {
      await Parcel.create({
        pickupId: pickup._id,
        customer: pickup.customer,
        weight: 1,
        type: 'General',
        quantity: 1,
        status: 'Picked'
      });
    }
  }

  return apiResponse(res, 200, 'Pickup status updated.', { pickup });
});

// ─── Update general fields ────────────────────────────────────────────────────
exports.update = catchAsync(async (req, res) => {
  const pickup = await Pickup.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!pickup) return apiResponse(res, 404, 'Pickup not found.');
  return apiResponse(res, 200, 'Pickup updated.', { pickup });
});

// ─── Delete ───────────────────────────────────────────────────────────────────
exports.remove = catchAsync(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return apiResponse(res, 404, 'Pickup not found.');

  if (pickup.status !== PICKUP_STATUS.REQUESTED) {
    return apiResponse(res, 400, 'Only pickups in Requested status can be deleted.');
  }

  await pickup.deleteOne();
  return apiResponse(res, 200, 'Pickup deleted.');
});