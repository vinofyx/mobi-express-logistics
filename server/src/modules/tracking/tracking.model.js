const mongoose = require('mongoose');

const TRACKING_EVENT_TYPE = {
  PICKUP_SCHEDULED: 'PICKUP_SCHEDULED',
  PICKUP_ASSIGNED: 'PICKUP_ASSIGNED',
  AGENT_EN_ROUTE: 'AGENT_EN_ROUTE',
  PICKED_UP: 'PICKED_UP',
  AT_HUB: 'AT_HUB',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED_ATTEMPT: 'FAILED_ATTEMPT',
  RETURNED: 'RETURNED',
  EXCEPTION: 'EXCEPTION'
};

const TRACKING_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

const LOCATION_TYPE = {
  PICKUP_ADDRESS: 'PICKUP_ADDRESS',
  HUB: 'HUB',
  VEHICLE: 'VEHICLE',
  DELIVERY_ADDRESS: 'DELIVERY_ADDRESS',
  CUSTOMER: 'CUSTOMER'
};

// Tracking event schema
const trackingEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: [true, 'Event type is required.'],
    enum: {
      values: Object.values(TRACKING_EVENT_TYPE),
      message: 'Invalid event type.'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required.'],
    enum: {
      values: Object.values(TRACKING_STATUS),
      message: 'Invalid status.'
    }
  },
  location: {
    type: {
      type: String,
      required: [true, 'Location type is required.'],
      enum: {
        values: Object.values(LOCATION_TYPE),
        message: 'Invalid location type.'
      }
    },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true }
    },
    hubName: { type: String, trim: true },
    vehicleNumber: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    }
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required.'],
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note must not exceed 500 characters.']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Updated by user is required.']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Customer-facing description
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description must not exceed 200 characters.']
  },
  // Estimated times
  estimatedArrival: Date,
  estimatedDelivery: Date
}, { _id: false });

// Main tracking schema
const trackingSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: [true, 'Tracking number is required.'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tracking number must not exceed 50 characters.']
  },
  
  // References
  parcel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcel',
    required: [true, 'Parcel reference is required.'],
    index: true
  },
  pickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup',
    index: true
  },
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer reference is required.'],
    index: true
  },

  // Current status
  currentStatus: {
    type: String,
    enum: {
      values: Object.values(TRACKING_STATUS),
      message: 'Invalid current status.'
    },
    default: TRACKING_STATUS.PENDING,
    index: true
  },
  lastEvent: {
    type: String,
    enum: {
      values: Object.values(TRACKING_EVENT_TYPE),
      message: 'Invalid last event type.'
    }
  },

  // Tracking events
  events: [trackingEventSchema],

  // Delivery information
  deliveryInfo: {
    deliveredTo: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      signature: { type: String, trim: true }
    },
    deliveryTime: Date,
    deliveryPhoto: { type: String }, // URL to photo
    proofOfDelivery: {
      type: {
        type: String,
        enum: ['SIGNATURE', 'PHOTO', 'OTP', 'NONE'],
        default: 'NONE'
      },
      data: { type: mongoose.Schema.Types.Mixed }
    }
  },

  // Exception handling
  exceptions: [{
    type: {
      type: String,
      enum: ['ADDRESS_INCORRECT', 'CUSTOMER_UNAVAILABLE', 'PACKAGE_DAMAGED', 'WEATHER_DELAY', 'CUSTOMER_REFUSED', 'OTHER'],
      required: true
    },
    description: { type: String, required: true, trim: true },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],

  // Estimated times
  estimatedPickup: Date,
  estimatedDelivery: Date,
  actualPickup: Date,
  actualDelivery: Date,

  // Route information
  route: [{
    location: {
      name: { type: String, required: true },
      type: {
        type: String,
        enum: Object.values(LOCATION_TYPE),
        required: true
      },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      },
      address: { type: String, trim: true }
    },
    arrivalTime: Date,
    departureTime: Date,
    status: {
      type: String,
      enum: ['PENDING', 'ARRIVED', 'DEPARTED', 'SKIPPED'],
      default: 'PENDING'
    }
  }],

  // Notifications
  notifications: {
    smsSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    pushNotificationSent: { type: Boolean, default: false },
    lastSmsAt: Date,
    lastEmailAt: Date,
    lastPushAt: Date
  },

  // Metadata
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  isInternational: { type: Boolean, default: false },
  requiresSignature: { type: Boolean, default: false },
  isFragile: { type: Boolean, default: false },
  value: { type: Number, min: 0 },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required.']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
trackingSchema.virtual('isDelivered').get(function() {
  return this.currentStatus === TRACKING_STATUS.COMPLETED && 
         this.lastEvent === TRACKING_EVENT_TYPE.DELIVERED;
});

trackingSchema.virtual('isInTransit').get(function() {
  return this.currentStatus === TRACKING_STATUS.IN_PROGRESS;
});

trackingSchema.virtual('hasExceptions').get(function() {
  return this.exceptions && this.exceptions.length > 0 && 
         !this.exceptions.every(exc => exc.resolved);
});

trackingSchema.virtual('currentLocation').get(function() {
  if (this.events && this.events.length > 0) {
    const lastEvent = this.events[this.events.length - 1];
    return lastEvent.location;
  }
  return null;
});

trackingSchema.virtual('lastUpdate').get(function() {
  if (this.events && this.events.length > 0) {
    return this.events[this.events.length - 1].timestamp;
  }
  return this.updatedAt;
});

trackingSchema.virtual('deliveryProgress').get(function() {
  if (!this.route || this.route.length === 0) return 0;
  
  const completedSteps = this.route.filter(step => 
    step.status === 'DEPARTED'
  ).length;
  
  return Math.round((completedSteps / this.route.length) * 100);
});

// Methods
trackingSchema.methods.addEvent = function(eventData, userId) {
  const event = {
    ...eventData,
    updatedBy: userId,
    timestamp: new Date()
  };

  this.events.push(event);
  this.lastEvent = event.eventType;
  
  // Update current status based on event
  if (event.eventType === TRACKING_EVENT_TYPE.DELIVERED) {
    this.currentStatus = TRACKING_STATUS.COMPLETED;
    this.actualDelivery = event.timestamp;
  } else if (event.eventType === TRACKING_EVENT_TYPE.FAILED_ATTEMPT) {
    this.currentStatus = TRACKING_STATUS.FAILED;
  } else if (event.eventType === TRACKING_EVENT_TYPE.PICKED_UP) {
    this.currentStatus = TRACKING_STATUS.IN_PROGRESS;
    this.actualPickup = event.timestamp;
  }

  return this.save();
};

trackingSchema.methods.addException = function(exceptionData) {
  this.exceptions.push({
    ...exceptionData,
    timestamp: new Date()
  });
  
  this.currentStatus = TRACKING_STATUS.FAILED;
  return this.save();
};

trackingSchema.methods.resolveException = function(exceptionIndex, resolvedBy, note) {
  if (this.exceptions[exceptionIndex]) {
    this.exceptions[exceptionIndex].resolved = true;
    this.exceptions[exceptionIndex].resolvedAt = new Date();
    this.exceptions[exceptionIndex].resolvedBy = resolvedBy;
    
    if (note) {
      this.exceptions[exceptionIndex].resolutionNote = note;
    }
    
    // Check if all exceptions are resolved
    if (this.exceptions.every(exc => exc.resolved)) {
      this.currentStatus = TRACKING_STATUS.IN_PROGRESS;
    }
    
    return this.save();
  }
  
  throw new Error('Exception not found at index');
};

trackingSchema.methods.updateRoute = function(locationData, status = 'ARRIVED') {
  const existingLocation = this.route.find(loc => 
    loc.location.coordinates.latitude === locationData.coordinates.latitude &&
    loc.location.coordinates.longitude === locationData.coordinates.longitude
  );

  if (existingLocation) {
    existingLocation.status = status;
    if (status === 'ARRIVED') {
      existingLocation.arrivalTime = new Date();
    } else if (status === 'DEPARTED') {
      existingLocation.departureTime = new Date();
    }
  } else {
    this.route.push({
      location: locationData,
      status,
      arrivalTime: status === 'ARRIVED' ? new Date() : undefined
    });
  }

  return this.save();
};

trackingSchema.methods.getEstimatedTimeRemaining = function() {
  if (!this.estimatedDelivery) return null;
  
  const now = new Date();
  const remaining = this.estimatedDelivery.getTime() - now.getTime();
  
  if (remaining <= 0) return 'Overdue';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  let timeString = '';
  if (days > 0) timeString += `${days}d `;
  if (hours > 0) timeString += `${hours}h `;
  if (minutes > 0) timeString += `${minutes}m`;
  
  return timeString.trim() || 'Less than 1m';
};

// Static methods
trackingSchema.statics.findByTrackingNumber = function(trackingNumber) {
  return this.findOne({ trackingNumber })
    .populate('parcel', 'trackingId weight dimensions')
    .populate('pickup', 'pickupId scheduledDate')
    .populate('shipment', 'shipmentId vehicleNumber')
    .populate('customer', 'name companyName phone email');
};

trackingSchema.statics.findByCustomer = function(customerId, options = {}) {
  const { limit = 10, page = 1, status } = options;
  
  const query = { customer: customerId };
  if (status) query.currentStatus = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('parcel', 'trackingId')
    .populate('pickup', 'pickupId');
};

trackingSchema.statics.getActiveTrackings = function() {
  return this.find({
    currentStatus: { $in: [TRACKING_STATUS.PENDING, TRACKING_STATUS.IN_PROGRESS] }
  }).populate('customer', 'name phone');
};

trackingSchema.statics.getOverdueDeliveries = function() {
  return this.find({
    currentStatus: TRACKING_STATUS.IN_PROGRESS,
    estimatedDelivery: { $lt: new Date() }
  }).populate('customer', 'name phone email');
};

trackingSchema.statics.getTrackingStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$currentStatus',
        count: { $sum: 1 },
        avgDeliveryTime: {
          $avg: {
            $cond: [
              { $and: [
                { $ne: ['$actualDelivery', null] },
                { $ne: ['$actualPickup', null] }
              ]},
              { $subtract: ['$actualDelivery', '$actualPickup'] },
              null
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalTrackings: { $sum: '$count' },
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            avgDeliveryTime: '$avgDeliveryTime'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
trackingSchema.pre('save', function(next) {
  // Generate tracking number if not present
  if (!this.trackingNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingNumber = `TRK${timestamp}${random}`;
  }

  // Update last update timestamp
  this.updatedAt = new Date();

  next();
});

// Indexes for performance
trackingSchema.index({ trackingNumber: 1 }, { unique: true });
trackingSchema.index({ parcel: 1, currentStatus: 1 });
trackingSchema.index({ pickup: 1 });
trackingSchema.index({ shipment: 1 });
trackingSchema.index({ customer: 1, currentStatus: 1 });
trackingSchema.index({ currentStatus: 1, priority: 1 });
trackingSchema.index({ 'events.timestamp': -1 });
trackingSchema.index({ estimatedDelivery: 1 });
trackingSchema.index({ createdAt: -1 });

// Export constants and model
module.exports = mongoose.model('Tracking', trackingSchema);
module.exports.TRACKING_EVENT_TYPE = TRACKING_EVENT_TYPE;
module.exports.TRACKING_STATUS = TRACKING_STATUS;
module.exports.LOCATION_TYPE = LOCATION_TYPE;
