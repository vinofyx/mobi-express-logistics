# Shipment (Hub) Module API Examples

## 🚀 **Base URL**: `http://localhost:5000/api/shipments`

---

## 1️⃣ **Create Shipment**

**Endpoint**: `POST /api/shipments`

**Request Body**:
```json
{
  "parcelIds": [
    "64a1b2c3d4e5f6789012345",
    "64a1b2c3d4e5f6789012346"
  ],
  "originHub": "HYD",
  "destinationHub": "BLR",
  "route": ["MUM", "PUNE"],
  "expectedArrival": "2026-04-20T10:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Shipment created and parcels dispatched.",
  "data": {
    "shipment": {
      "_id": "64a1b2c3d4e5f6789012347",
      "shipmentId": "SHP-HYD-20260417-ABC1",
      "parcels": [...],
      "originHub": "HYD",
      "destinationHub": "BLR",
      "status": "Dispatched",
      "createdAt": "2026-04-17T08:00:00Z",
      "expectedArrival": "2026-04-20T10:00:00Z"
    }
  }
}
```

---

## 2️⃣ **Assign Parcels to Shipment**

**Endpoint**: `POST /api/shipments/:id/parcels`

**Request Body**:
```json
{
  "parcelIds": [
    "64a1b2c3d4e5f6789012348",
    "64a1b2c3d4e5f6789012349"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Parcels added to shipment.",
  "data": {
    "shipment": {
      "_id": "64a1b2c3d4e5f6789012347",
      "shipmentId": "SHP-HYD-20260417-ABC1",
      "parcels": [...], // Updated with new parcels
      "status": "Dispatched"
    }
  }
}
```

---

## 3️⃣ **Update Shipment Status**

**Endpoint**: `PATCH /api/shipments/:id/status`

**Request Body**:
```json
{
  "status": "In Transit",
  "note": "Shipment departed from Hyderabad hub",
  "location": "Hyderabad Hub"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Shipment status updated.",
  "data": {
    "shipment": {
      "_id": "64a1b2c3d4e5f6789012347",
      "shipmentId": "SHP-HYD-20260417-ABC1",
      "status": "In Transit",
      "statusHistory": [
        {
          "status": "Dispatched",
          "updatedBy": "...",
          "timestamp": "2026-04-17T08:00:00Z"
        },
        {
          "status": "In Transit",
          "updatedBy": "...",
          "note": "Shipment departed from Hyderabad hub",
          "location": "Hyderabad Hub",
          "timestamp": "2026-04-17T10:00:00Z"
        }
      ]
    }
  }
}
```

---

## 4️⃣ **Get All Shipments**

**Endpoint**: `GET /api/shipments`

**Query Parameters**:
- `status` - Filter by status (Dispatched, In Transit, Received)
- `originHub` - Filter by origin hub
- `destinationHub` - Filter by destination hub
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example**: `GET /api/shipments?status=In Transit&originHub=HYD`

**Response**:
```json
{
  "success": true,
  "message": "Shipments retrieved.",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "shipmentId": "SHP-HYD-20260417-ABC1",
      "parcels": [...],
      "originHub": "HYD",
      "destinationHub": "BLR",
      "status": "In Transit",
      "createdAt": "2026-04-17T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## 5️⃣ **Get Single Shipment**

**Endpoint**: `GET /api/shipments/:id`

**Response**:
```json
{
  "success": true,
  "message": "Shipment retrieved.",
  "data": {
    "shipment": {
      "_id": "64a1b2c3d4e5f6789012347",
      "shipmentId": "SHP-HYD-20260417-ABC1",
      "parcels": [
        {
          "_id": "...",
          "trackingId": "LMS-HYD-20260417-XYZ1",
          "status": "In Transit",
          "weight": 2.5,
          "type": "General"
        }
      ],
      "originHub": "HYD",
      "destinationHub": "BLR",
      "route": ["MUM", "PUNE"],
      "status": "In Transit",
      "statusHistory": [...],
      "createdAt": "2026-04-17T08:00:00Z",
      "expectedArrival": "2026-04-20T10:00:00Z"
    }
  }
}
```

---

## 6️⃣ **Track Shipment (Public)**

**Endpoint**: `GET /api/shipments/track/:shipmentId`

**Example**: `GET /api/shipments/track/SHP-HYD-20260417-ABC1`

**Response**:
```json
{
  "success": true,
  "message": "Shipment tracking information.",
  "data": {
    "shipment": {
      "shipmentId": "SHP-HYD-20260417-ABC1",
      "status": "In Transit",
      "originHub": "HYD",
      "destinationHub": "BLR",
      "statusHistory": [
        {
          "status": "Dispatched",
          "location": "Hyderabad Hub",
          "timestamp": "2026-04-17T08:00:00Z"
        },
        {
          "status": "In Transit",
          "location": "En Route",
          "timestamp": "2026-04-17T10:00:00Z"
        }
      ],
      "createdAt": "2026-04-17T08:00:00Z",
      "expectedArrival": "2026-04-20T10:00:00Z",
      "parcels": [
        {
          "trackingId": "LMS-HYD-20260417-XYZ1",
          "status": "In Transit"
        }
      ]
    }
  }
}
```

---

## 🔄 **Status Flow**

```
Dispatched → In Transit → Received
     ↓           ↓           ↓
  Parcels    Parcels    Parcels
In Transit  In Transit  Delivered
```

---

## 📋 **Status Transitions Rules**

- **Dispatched** → **In Transit** ✅
- **In Transit** → **Received** ✅
- **Received** → Terminal state ❌

---

## 🚨 **Important Notes**

1. **Authentication**: Currently disabled for testing
2. **Authorization**: Role-based access will be enforced when re-enabled
3. **Validation**: All requests are validated against schemas
4. **Auto-updates**: Parcel status updates automatically with shipment status
5. **Shipment ID Format**: `SHP-{HUB_CODE}-{YYYYMMDD}-{UNIQUE_ID}`

---

## 🔧 **Testing Commands**

```bash
# Start server
npm start

# Test APIs (using curl or Postman)
curl -X POST http://localhost:5000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{"parcelIds": ["..."], "originHub": "HYD", "destinationHub": "BLR"}'

curl -X GET http://localhost:5000/api/shipments

curl -X GET http://localhost:5000/api/shipments/track/SHP-HYD-20260417-ABC1
```
