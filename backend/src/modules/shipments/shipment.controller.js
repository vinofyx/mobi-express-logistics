const Shipment    = require('./shipment.model');
const Parcel      = require('../parcels/parcel.model');
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');
const paginate    = require('../../shared/utils/paginate');
const { SHIPMENT_STATUS, PARCEL_STATUS } = require('../../shared/constants/status');

// ─── Status transition rules ───────────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  [SHIPMENT_STATUS.DISPATCHED]:  [SHIPMENT_STATUS.IN_TRANSIT],
  [SHIPMENT_STATUS.IN_TRANSIT]:  [SHIPMENT_STATUS.RECEIVED],
  [SHIPMENT_STATUS.RECEIVED]:    [],
};

// ─── Create shipment ─────────────────────────────────────────────────────────

exports.create = catchAsync(async (req, res) => {
  const { parcelIds, originHub, destinationHub, route, expectedArrival } = req.body;

  // Validate all parcel IDs exist and are at center
  const parcels = await Parcel.find({ _id: { $in: parcelIds } });
  if (parcels.length !== parcelIds.length) {
    return apiResponse(res, 400, 'One or more parcel IDs are invalid.');
  }

  const notReady = parcels.filter((p) => p.status !== PARCEL_STATUS.AT_CENTER);
  if (notReady.length > 0) {
    return apiResponse(
      res,
      400,
      `Parcels must be in 'At Center' status before dispatch. Invalid: ${notReady.map((p) => p.trackingId).join(', ')}`,
    );
  }

  const shipment = await Shipment.create({
    parcels:        parcelIds,
    originHub,
    destinationHub,
    route:          route ?? [],
    expectedArrival,
    dispatchedAt:   new Date(),
    createdBy:      req.user._id,
    statusHistory:  [{ status: SHIPMENT_STATUS.DISPATCHED, updatedBy: req.user._id }],
  });

  // Move parcels to In Transit
  await Parcel.updateMany(
    { _id: { $in: parcelIds } },
    {
      $set:  { status: PARCEL_STATUS.IN_TRANSIT, shipment: shipment._id },
      $push: { statusHistory: { status: PARCEL_STATUS.IN_TRANSIT, updatedBy: req.user._id } },
    },
  );

  return apiResponse(res, 201, 'Shipment created and parcels dispatched.', { shipment });
});

// ─── List ─────────────────────────────────────────────────────────────────────

exports.list = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status)         filter.status         = req.query.status;
  if (req.query.originHub)      filter.originHub      = req.query.originHub;
  if (req.query.destinationHub) filter.destinationHub = req.query.destinationHub;

  const result = await paginate(Shipment, filter, req.query, [
    { path: 'createdBy', select: 'name' },
  ]);
  return apiResponse(res, 200, 'Shipments retrieved.', result.data, result.meta);
});

// ─── Get one ─────────────────────────────────────────────────────────────────

exports.getOne = catchAsync(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate('parcels',   'trackingId weight type status customer')
    .populate('createdBy', 'name');

  if (!shipment) return apiResponse(res, 404, 'Shipment not found.');
  return apiResponse(res, 200, 'Shipment retrieved.', { shipment });
});

// ─── Assign additional parcels ────────────────────────────────────────────────

exports.assignParcels = catchAsync(async (req, res) => {
  const { parcelIds } = req.body;

  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return apiResponse(res, 404, 'Shipment not found.');

  if (shipment.status !== SHIPMENT_STATUS.DISPATCHED) {
    return apiResponse(res, 400, 'Parcels can only be added to a Dispatched shipment.');
  }

  const parcels = await Parcel.find({ _id: { $in: parcelIds } });
  const notReady = parcels.filter((p) => p.status !== PARCEL_STATUS.AT_CENTER);
  if (notReady.length > 0) {
    return apiResponse(res, 400, 'All parcels must be At Center before adding to shipment.');
  }

  shipment.parcels.push(...parcelIds);
  await shipment.save();

  await Parcel.updateMany(
    { _id: { $in: parcelIds } },
    {
      $set:  { status: PARCEL_STATUS.IN_TRANSIT, shipment: shipment._id },
      $push: { statusHistory: { status: PARCEL_STATUS.IN_TRANSIT, updatedBy: req.user._id } },
    },
  );

  return apiResponse(res, 200, 'Parcels added to shipment.', { shipment });
});

// ─── Update status ────────────────────────────────────────────────────────────

exports.updateStatus = catchAsync(async (req, res) => {
  const { status, note, location } = req.body;

  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return apiResponse(res, 404, 'Shipment not found.');

  const allowed = ALLOWED_TRANSITIONS[shipment.status] ?? [];
  if (!allowed.includes(status)) {
    return apiResponse(
      res,
      400,
      `Cannot transition from '${shipment.status}' to '${status}'.`,
    );
  }

  shipment.status = status;
  shipment.statusHistory.push({ status, updatedBy: req.user._id, note, location });
  if (status === SHIPMENT_STATUS.RECEIVED) shipment.receivedAt = new Date();
  await shipment.save();

  // When received — mark all parcels as Delivered
  if (status === SHIPMENT_STATUS.RECEIVED) {
    await Parcel.updateMany(
      { shipment: shipment._id },
      {
        $set:  { status: PARCEL_STATUS.DELIVERED },
        $push: { statusHistory: { status: PARCEL_STATUS.DELIVERED, updatedBy: req.user._id, note: 'Shipment received at destination hub.' } },
      },
    );
  }

  return apiResponse(res, 200, 'Shipment status updated.', { shipment });
});

// ─── Track Shipment (Public) ───────────────────────────────────────────────────

exports.track = catchAsync(async (req, res) => {
  const { shipmentId } = req.params;

  const shipment = await Shipment.findOne({ shipmentId: shipmentId.toUpperCase() })
    .populate('parcels', 'trackingId status')
    .select('shipmentId status originHub destinationHub statusHistory createdAt expectedArrival receivedAt');

  if (!shipment) return apiResponse(res, 404, 'Shipment not found.');

  return apiResponse(res, 200, 'Shipment tracking information.', { shipment });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

exports.remove = catchAsync(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return apiResponse(res, 404, 'Shipment not found.');

  if (shipment.status !== SHIPMENT_STATUS.DISPATCHED) {
    return apiResponse(res, 400, 'Only Dispatched shipments can be deleted.');
  }

  await shipment.deleteOne();
  return apiResponse(res, 200, 'Shipment deleted.');
});
