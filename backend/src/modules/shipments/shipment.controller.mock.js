// Mock shipment controller for minimal server
// This controller works without MongoDB dependencies

exports.list = async (req, res) => {
  const mockShipments = [
    {
      _id: '64f8a1b2c3d4e5f6a7b8c9d2',
      shipmentId: 'SHP-HYD-20260417-ABC1',
      status: 'In Transit',
      originHub: 'HYD',
      destinationHub: 'BLR',
      parcels: [
        {
          trackingId: 'LMS-HYD-20260417-XYZ1',
          status: 'In Transit',
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 10 }
        }
      ],
      statusHistory: [
        {
          status: 'Created',
          location: 'Hyderabad',
          note: 'Shipment created',
          timestamp: '2026-04-17T10:00:00Z'
        },
        {
          status: 'In Transit',
          location: 'Bangalore',
          note: 'Shipment in transit',
          timestamp: '2026-04-17T12:00:00Z'
        }
      ],
      createdAt: '2026-04-17T10:00:00Z',
      updatedAt: '2026-04-17T12:00:00Z'
    },
    {
      _id: '64f8a1b2c3d4e5f6a7b8c9d3',
      shipmentId: 'SHP-BLR-20260417-DEF1',
      status: 'Created',
      originHub: 'BLR',
      destinationHub: 'DEL',
      parcels: [],
      statusHistory: [
        {
          status: 'Created',
          location: 'Bangalore',
          note: 'Shipment created',
          timestamp: '2026-04-17T10:00:00Z'
        }
      ],
      createdAt: '2026-04-17T10:00:00Z',
      updatedAt: '2026-04-17T10:00:00Z'
    }
  ];

  res.json({
    success: true,
    message: 'Shipments retrieved successfully',
    data: mockShipments
  });
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  
  const mockShipment = {
    _id: id,
    shipmentId: 'SHP-HYD-20260417-ABC1',
    status: 'In Transit',
    originHub: 'HYD',
    destinationHub: 'BLR',
    parcels: [
      {
        trackingId: 'LMS-HYD-20260417-XYZ1',
        status: 'In Transit',
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 10 }
      }
    ],
    statusHistory: [
      {
        status: 'Created',
        location: 'Hyderabad',
        note: 'Shipment created',
        timestamp: '2026-04-17T10:00:00Z'
      },
      {
        status: 'In Transit',
        location: 'Bangalore',
        note: 'Shipment in transit',
        timestamp: '2026-04-17T12:00:00Z'
      }
    ],
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T12:00:00Z'
  };

  res.json({
    success: true,
    message: 'Shipment retrieved successfully',
    data: mockShipment
  });
};

exports.track = async (req, res) => {
  const { shipmentId } = req.params;
  
  const mockShipment = {
    success: true,
    message: 'Shipment found successfully',
    data: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d1',
      shipmentId: shipmentId,
      status: 'In Transit',
      originHub: 'HYD',
      destinationHub: 'BLR',
      currentLocation: 'Bangalore',
      estimatedDelivery: '2026-04-18T18:00:00Z',
      parcels: [
        {
          trackingId: 'LMS-HYD-20260417-XYZ1',
          status: 'In Transit',
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 10 }
        }
      ],
      statusHistory: [
        {
          status: 'Created',
          location: 'Hyderabad',
          note: 'Shipment created',
          timestamp: '2026-04-17T10:00:00Z'
        },
        {
          status: 'In Transit',
          location: 'Bangalore',
          note: 'Shipment in transit',
          timestamp: '2026-04-17T12:00:00Z'
        }
      ]
    }
  };

  res.json(mockShipment);
};

exports.create = async (req, res) => {
  const { originHub, destinationHub, expectedArrival, parcelIds } = req.body;
  
  if (!originHub || !destinationHub) {
    return res.status(400).json({
      success: false,
      message: 'Origin hub and destination hub are required',
      data: null
    });
  }

  const shipmentId = `SHP-${originHub}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  
  const selectedParcels = parcelIds ? parcelIds.map(id => ({
    trackingId: `LMS-${originHub}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    status: 'In Transit'
  })) : [];

  const mockShipment = {
    success: true,
    message: 'Shipment created successfully',
    data: {
      _id: `64f8a1b2c3d4e5f6a7b8c9d${Math.random().toString(36).substr(2, 3)}`,
      shipmentId: shipmentId,
      status: 'Created',
      originHub: originHub,
      destinationHub: destinationHub,
      parcels: selectedParcels,
      statusHistory: [
        {
          status: 'Created',
          location: originHub,
          note: 'Shipment created and parcels assigned',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  console.log(`New shipment created: ${shipmentId} from ${originHub} to ${destinationHub} with ${selectedParcels.length} parcels`);
  res.status(201).json(mockShipment);
};

exports.assignParcels = async (req, res) => {
  const { id } = req.params;
  const { parcelIds } = req.body;

  if (!parcelIds || parcelIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Parcel IDs are required',
      data: null
    });
  }

  const mockShipment = {
    success: true,
    message: 'Parcels assigned to shipment successfully',
    data: {
      _id: id,
      shipmentId: 'SHP-HYD-20260417-ABC1',
      status: 'In Transit',
      parcels: parcelIds.map(id => ({
        trackingId: id,
        status: 'In Transit'
      })),
      updatedAt: new Date().toISOString()
    }
  };

  console.log(`Parcels assigned to shipment ${id}: ${parcelIds.join(', ')}`);
  res.json(mockShipment);
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note, location } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
      data: null
    });
  }

  const mockShipment = {
    success: true,
    message: 'Shipment status updated successfully',
    data: {
      _id: id,
      shipmentId: 'SHP-HYD-20260417-ABC1',
      status: status,
      statusHistory: [
        {
          status: 'Created',
          location: 'Hyderabad',
          note: 'Shipment created',
          timestamp: '2026-04-17T10:00:00Z'
        },
        {
          status: status,
          location: location || 'Unknown',
          note: note || 'Status updated',
          timestamp: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    }
  };

  console.log(`Shipment ${id} status updated to: ${status}`);
  res.json(mockShipment);
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  const mockShipment = {
    success: true,
    message: 'Shipment deleted successfully',
    data: {
      _id: id,
      shipmentId: 'SHP-HYD-20260417-ABC1',
      deletedAt: new Date().toISOString()
    }
  };

  console.log(`Shipment ${id} deleted`);
  res.json(mockShipment);
};
