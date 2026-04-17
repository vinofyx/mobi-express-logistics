const PICKUP_STATUS = Object.freeze({
  REQUESTED: 'Requested',
  ASSIGNED:  'Assigned',
  PICKED:    'Picked',
  FAILED:    'Failed',
});

const SHIPMENT_STATUS = Object.freeze({
  DISPATCHED:  'Dispatched',
  IN_TRANSIT:  'In Transit',
  RECEIVED:    'Received',
});

const PARCEL_STATUS = Object.freeze({
  PENDING:     'Pending',
  IN_PICKUP:   'In Pickup',
  AT_CENTER:   'At Center',
  IN_TRANSIT:  'In Transit',
  DELIVERED:   'Delivered',
  RETURNED:    'Returned',
});

module.exports = { PICKUP_STATUS, SHIPMENT_STATUS, PARCEL_STATUS };
