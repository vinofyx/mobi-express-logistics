const Parcel      = require('./parcel.model');
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');
const paginate    = require('../../shared/utils/paginate');
const { PARCEL_STATUS } = require('../../shared/constants/status');

// ─── Status transition rules ───────────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  [PARCEL_STATUS.PENDING]:    [PARCEL_STATUS.IN_PICKUP],
  [PARCEL_STATUS.IN_PICKUP]:  [PARCEL_STATUS.AT_CENTER],
  [PARCEL_STATUS.AT_CENTER]:  [PARCEL_STATUS.IN_TRANSIT],
  [PARCEL_STATUS.IN_TRANSIT]: [PARCEL_STATUS.DELIVERED, PARCEL_STATUS.RETURNED],
  [PARCEL_STATUS.DELIVERED]:  [],
  [PARCEL_STATUS.RETURNED]:   [],
};

// ─── Add parcel ───────────────────────────────────────────────────────────────

exports.add = catchAsync(async (req, res) => {
  const parcel = await Parcel.create({
    ...req.body,
    createdBy:     req.user._id,
    statusHistory: [{ status: PARCEL_STATUS.PENDING, updatedBy: req.user._id }],
  });
  return apiResponse(res, 201, 'Parcel added.', { parcel });
});

// ─── List ─────────────────────────────────────────────────────────────────────

exports.list = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.customer) filter.customer  = req.query.customer;
  if (req.query.shipment) filter.shipment  = req.query.shipment;

  const result = await paginate(Parcel, filter, req.query, [
    { path: 'customer', select: 'name phone' },
    { path: 'pickup',   select: 'pickupDate status' },
  ]);
  return apiResponse(res, 200, 'Parcels retrieved.', result.data, result.meta);
});

// ─── Get one ─────────────────────────────────────────────────────────────────

exports.getOne = catchAsync(async (req, res) => {
  const parcel = await Parcel.findById(req.params.id)
    .populate('customer',  'name phone address')
    .populate('pickup',    'pickupDate assignedAgent status')
    .populate('shipment',  'status originHub destinationHub')
    .populate('createdBy', 'name');

  if (!parcel) return apiResponse(res, 404, 'Parcel not found.');
  return apiResponse(res, 200, 'Parcel retrieved.', { parcel });
});

// ─── Public tracking by trackingId ───────────────────────────────────────────

exports.track = catchAsync(async (req, res) => {
  const parcel = await Parcel.findOne({ trackingId: req.params.trackingId })
    .select('trackingId status statusHistory weight type')
    .lean();

  if (!parcel) return apiResponse(res, 404, 'Tracking ID not found.');
  return apiResponse(res, 200, 'Tracking info retrieved.', { parcel });
});

// ─── Update status ────────────────────────────────────────────────────────────

exports.updateStatus = catchAsync(async (req, res) => {
  const { status, note, location } = req.body;

  const parcel  = await Parcel.findById(req.params.id);
  if (!parcel) return apiResponse(res, 404, 'Parcel not found.');

  const allowed = ALLOWED_TRANSITIONS[parcel.status] ?? [];
  if (!allowed.includes(status)) {
    return apiResponse(
      res,
      400,
      `Cannot transition from '${parcel.status}' to '${status}'.`,
    );
  }

  parcel.status = status;
  parcel.statusHistory.push({ status, updatedBy: req.user._id, note, location });
  await parcel.save();

  return apiResponse(res, 200, 'Parcel status updated.', { parcel });
});

// ─── Update general fields ────────────────────────────────────────────────────

exports.update = catchAsync(async (req, res) => {
  const parcel = await Parcel.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!parcel) return apiResponse(res, 404, 'Parcel not found.');
  return apiResponse(res, 200, 'Parcel updated.', { parcel });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

exports.remove = catchAsync(async (req, res) => {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return apiResponse(res, 404, 'Parcel not found.');

  if (parcel.status !== PARCEL_STATUS.PENDING) {
    return apiResponse(res, 400, 'Only Pending parcels can be deleted.');
  }

  await parcel.deleteOne();
  return apiResponse(res, 200, 'Parcel deleted.');
});
