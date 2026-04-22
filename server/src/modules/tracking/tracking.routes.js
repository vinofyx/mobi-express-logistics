const express = require('express');
const router = express.Router();
const Tracking = require('./tracking.model');
const Parcel = require('../parcels/parcel.model');
const Pickup = require('../pickups/pickup.model');
const catchAsync = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');

// ─── Public Tracking Endpoints ─────────────────────────────────────────────────────

// GET /api/v1/tracking/:trackingNumber - Public tracking lookup
router.get('/:trackingNumber', catchAsync(async (req, res) => {
  const { trackingNumber } = req.params;
  
  const tracking = await Tracking.findByTrackingNumber(trackingNumber);
  
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking number not found.');
  }

  // Return public-safe data (hide sensitive information)
  const publicData = {
    trackingNumber: tracking.trackingNumber,
    currentStatus: tracking.currentStatus,
    lastEvent: tracking.lastEvent,
    currentLocation: tracking.currentLocation,
    events: tracking.events.map(event => ({
      eventType: event.eventType,
      status: event.status,
      location: event.location,
      timestamp: event.timestamp,
      description: event.description
    })),
    estimatedPickup: tracking.estimatedPickup,
    estimatedDelivery: tracking.estimatedDelivery,
    deliveryProgress: tracking.deliveryProgress,
    isDelivered: tracking.isDelivered,
    isInTransit: tracking.isInTransit,
    parcel: {
      trackingId: tracking.parcel?.trackingId,
      weight: tracking.parcel?.weight,
      type: tracking.parcel?.type
    },
    customer: {
      name: tracking.customer?.type === 'B2B' ? 
        tracking.customer.companyName : 
        tracking.customer.name
    }
  };

  return apiResponse(res, 200, 'Tracking information retrieved.', { tracking: publicData });
}));

// GET /api/v1/tracking/:trackingNumber/events - Get tracking events only
router.get('/:trackingNumber/events', catchAsync(async (req, res) => {
  const { trackingNumber } = req.params;
  const { limit = 20 } = req.query;
  
  const tracking = await Tracking.findOne({ trackingNumber })
    .select('events currentStatus estimatedDelivery')
    .lean();
  
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking number not found.');
  }

  const events = tracking.events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

  return apiResponse(res, 200, 'Tracking events retrieved.', {
    events,
    currentStatus: tracking.currentStatus,
    estimatedDelivery: tracking.estimatedDelivery
  });
}));

// GET /api/v1/tracking/:trackingNumber/route - Get delivery route
router.get('/:trackingNumber/route', catchAsync(async (req, res) => {
  const { trackingNumber } = req.params;
  
  const tracking = await Tracking.findOne({ trackingNumber })
    .select('route currentLocation deliveryProgress')
    .lean();
  
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking number not found.');
  }

  return apiResponse(res, 200, 'Route information retrieved.', {
    route: tracking.route || [],
    currentLocation: tracking.currentLocation,
    deliveryProgress: tracking.deliveryProgress || 0
  });
}));

// POST /api/v1/tracking/:trackingNumber/subscribe - Subscribe to notifications (public)
router.post('/:trackingNumber/subscribe', catchAsync(async (req, res) => {
  const { trackingNumber } = req.params;
  const { email, phone, preferences } = req.body;
  
  if (!email && !phone) {
    return apiResponse(res, 400, 'Email or phone number is required.');
  }

  const tracking = await Tracking.findOne({ trackingNumber });
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking number not found.');
  }

  // In a real implementation, you would store subscriptions in a separate collection
  // For now, just update notification flags
  tracking.notifications.smsSent = true;
  tracking.notifications.emailSent = true;
  await tracking.save();

  return apiResponse(res, 200, 'Successfully subscribed to tracking notifications.');
}));

// ─── Staff Management Endpoints ─────────────────────────────────────────────────────

// GET /api/v1/tracking - Staff: Get all tracking records
router.get('/', catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    customer,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filter = {};
  
  if (status) filter.currentStatus = status;
  if (customer) filter.customer = customer;
  if (search) {
    filter.$or = [
      { trackingNumber: new RegExp(search, 'i') },
      { 'customer.name': new RegExp(search, 'i') },
      { 'customer.companyName': new RegExp(search, 'i') }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const tracking = await Tracking.find(filter)
    .sort(sort)
    .limit(parseInt(limit) * 1)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('customer', 'name companyName phone email')
    .populate('parcel', 'trackingId weight type')
    .populate('pickup', 'pickupId scheduledDate')
    .populate('shipment', 'shipmentId vehicleNumber');

  const total = await Tracking.countDocuments(filter);

  return apiResponse(res, 200, 'Tracking records retrieved.', {
    tracking,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
}));

// GET /api/v1/tracking/active - Staff: Get active trackings
router.get('/active', catchAsync(async (req, res) => {
  const activeTrackings = await Tracking.getActiveTrackings();
  
  return apiResponse(res, 200, 'Active trackings retrieved.', { 
    trackings: activeTrackings 
  });
}));

// GET /api/v1/tracking/overdue - Staff: Get overdue deliveries
router.get('/overdue', catchAsync(async (req, res) => {
  const overdueDeliveries = await Tracking.getOverdueDeliveries();
  
  return apiResponse(res, 200, 'Overdue deliveries retrieved.', { 
    deliveries: overdueDeliveries 
  });
}));

// GET /api/v1/tracking/stats - Staff: Get tracking statistics
router.get('/stats', catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  const stats = await Tracking.getTrackingStats(start, end);
  
  return apiResponse(res, 200, 'Tracking statistics retrieved.', { 
    stats,
    period: { startDate: start, endDate: end }
  });
}));

// GET /api/v1/tracking/customer/:customerId - Staff: Get customer's tracking history
router.get('/customer/:customerId', catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const { limit = 10, page = 1, status } = req.query;
  
  const tracking = await Tracking.findByCustomer(customerId, {
    limit: parseInt(limit),
    page: parseInt(page),
    status
  });
  
  return apiResponse(res, 200, 'Customer tracking history retrieved.', { 
    tracking 
  });
}));

// POST /api/v1/tracking - Staff: Create new tracking record
router.post('/', catchAsync(async (req, res) => {
  const {
    trackingNumber,
    parcelId,
    pickupId,
    shipmentId,
    customerId,
    estimatedPickup,
    estimatedDelivery,
    priority = 'MEDIUM'
  } = req.body;

  if (!parcelId || !customerId) {
    return apiResponse(res, 400, 'Parcel ID and Customer ID are required.');
  }

  const trackingData = {
    trackingNumber,
    parcel: parcelId,
    pickup: pickupId,
    shipment: shipmentId,
    customer: customerId,
    estimatedPickup: estimatedPickup ? new Date(estimatedPickup) : undefined,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
    priority,
    createdBy: req.user?._id
  };

  const tracking = await Tracking.create(trackingData);
  await tracking.populate('customer parcel pickup shipment');

  return apiResponse(res, 201, 'Tracking record created.', { tracking });
}));

// POST /api/v1/tracking/:trackingId/events - Staff: Add tracking event
router.post('/:trackingId/events', catchAsync(async (req, res) => {
  const { trackingId } = req.params;
  const {
    eventType,
    status,
    location,
    note,
    description,
    estimatedArrival,
    estimatedDelivery
  } = req.body;

  if (!eventType || !status || !location) {
    return apiResponse(res, 400, 'Event type, status, and location are required.');
  }

  const tracking = await Tracking.findOne({ trackingNumber: trackingId });
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking record not found.');
  }

  const eventData = {
    eventType,
    status,
    location,
    note,
    description,
    estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
  };

  await tracking.addEvent(eventData, req.user?._id);

  return apiResponse(res, 201, 'Tracking event added.', { tracking });
}));

// POST /api/v1/tracking/:trackingId/route - Staff: Update route
router.post('/:trackingId/route', catchAsync(async (req, res) => {
  const { trackingId } = req.params;
  const { locationData, status = 'ARRIVED' } = req.body;

  if (!locationData || !locationData.coordinates) {
    return apiResponse(res, 400, 'Location data with coordinates is required.');
  }

  const tracking = await Tracking.findOne({ trackingNumber: trackingId });
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking record not found.');
  }

  await tracking.updateRoute(locationData, status);

  return apiResponse(res, 200, 'Route updated.', { tracking });
}));

// POST /api/v1/tracking/:trackingId/exceptions - Staff: Add exception
router.post('/:trackingId/exceptions', catchAsync(async (req, res) => {
  const { trackingId } = req.params;
  const { type, description } = req.body;

  if (!type || !description) {
    return apiResponse(res, 400, 'Exception type and description are required.');
  }

  const tracking = await Tracking.findOne({ trackingNumber: trackingId });
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking record not found.');
  }

  await tracking.addException({ type, description });

  return apiResponse(res, 201, 'Exception added.', { tracking });
}));

// PATCH /api/v1/tracking/:trackingId/exceptions/:index/resolve - Staff: Resolve exception
router.patch('/:trackingId/exceptions/:index/resolve', catchAsync(async (req, res) => {
  const { trackingId, index } = req.params;
  const { note } = req.body;

  const tracking = await Tracking.findOne({ trackingNumber: trackingId });
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking record not found.');
  }

  await tracking.resolveException(
    parseInt(index), 
    req.user?._id, 
    note
  );

  return apiResponse(res, 200, 'Exception resolved.', { tracking });
}));

// PATCH /api/v1/tracking/:trackingId/delivery - Staff: Record delivery
router.patch('/:trackingId/delivery', catchAsync(async (req, res) => {
  const { trackingId } = req.params;
  const {
    deliveredTo,
    deliveryPhoto,
    proofOfDelivery,
    note
  } = req.body;

  const tracking = await Tracking.findOne({ trackingNumber: trackingId });
  if (!tracking) {
    return apiResponse(res, 404, 'Tracking record not found.');
  }

  // Update delivery information
  tracking.deliveryInfo = {
    deliveredTo,
    deliveryTime: new Date(),
    deliveryPhoto,
    proofOfDelivery
  };

  // Add delivered event
  await tracking.addEvent({
    eventType: 'DELIVERED',
    status: 'COMPLETED',
    location: tracking.currentLocation,
    note,
    description: 'Package delivered successfully'
  }, req.user?._id);

  return apiResponse(res, 200, 'Delivery recorded.', { tracking });
}));

// GET /api/v1/tracking/:trackingId/eta - Get estimated time remaining
router.get('/:trackingId/eta', catchAsync(async (req, res) => {
  const { trackingId } = req.params;
  
  const tracking = await Tracking.findOne({ trackingNumber: trackingId })
    .select('estimatedDelivery currentStatus lastUpdate')
    .lean();

  if (!tracking) {
    return apiResponse(res, 404, 'Tracking number not found.');
  }

  const timeRemaining = tracking.getEstimatedTimeRemaining ? 
    tracking.getEstimatedTimeRemaining() : null;

  return apiResponse(res, 200, 'ETA information retrieved.', {
    estimatedDelivery: tracking.estimatedDelivery,
    currentStatus: tracking.currentStatus,
    timeRemaining,
    lastUpdate: tracking.lastUpdate
  });
}));

module.exports = router;
