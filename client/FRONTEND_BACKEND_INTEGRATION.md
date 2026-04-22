# Frontend-Backend Integration Guide

## 🚀 **Overview**

This document explains how the frontend (Trackwell System) connects to the backend (LMS API) and provides instructions for testing and development.

---

## 📁 **Files Created/Modified**

### 🆕 **New Files**
- `src/lib/api.js` - Main API configuration and methods
- `src/lib/api.d.ts` - TypeScript declarations for API
- `src/test-api.tsx` - API connection test component
- `FRONTEND_BACKEND_INTEGRATION.md` - This documentation

### 🔄 **Modified Files**
- `src/routes/dashboard.admin.shipments.tsx` - Updated to use backend API
- `src/routes/dashboard.customer.index.tsx` - Updated to use backend API
- `src/lib/shipment-utils.ts` - Added new backend statuses

---

## 🔧 **API Configuration**

### **Base Configuration**
```javascript
// src/lib/api.js
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### **Available API Methods**

#### **Shipments API**
```javascript
import { shipmentsAPI } from '@/lib/api';

// Get all shipments
const response = await shipmentsAPI.getAll();

// Get single shipment
const shipment = await shipmentsAPI.getById(id);

// Create shipment
const newShipment = await shipmentsAPI.create(data);

// Update shipment status
await shipmentsAPI.updateStatus(id, 'In Transit', 'Note', 'Location');

// Track shipment (public)
const tracking = await shipmentsAPI.track('SHP-HYD-20260417-ABC1');
```

#### **Parcels API**
```javascript
import { parcelsAPI } from '@/lib/api';

// Get all parcels
const parcels = await parcelsAPI.getAll();

// Get by tracking ID
const parcel = await parcelsAPI.getByTrackingId('LMS-HYD-20260417-XYZ1');

// Create parcel from pickup
const newParcel = await parcelsAPI.createFromPickup(data);

// Update parcel status
await parcelsAPI.updateStatus(id, 'In Transit', 'Status note');
```

#### **Pickups API**
```javascript
import { pickupsAPI } from '@/lib/api';

// Get all pickups
const pickups = await pickupsAPI.getAll();

// Create pickup
const newPickup = await pickupsAPI.create(data);

// Update pickup status
await pickupsAPI.updateStatus(id, 'Picked');
```

#### **Customers API**
```javascript
import { customersAPI } from '@/lib/api';

// Get all customers
const customers = await customersAPI.getAll();

// Create customer
const newCustomer = await customersAPI.create(data);
```

---

## 🔄 **Status Mapping**

### **Backend Shipment Statuses**
- `Created` - Initial state
- `Dispatched` - Shipment created and parcels assigned
- `In Transit` - Shipment is in transit
- `Received` - Shipment received at destination

### **Legacy Statuses (Compatibility)**
- `pending_pickup` → `Created`
- `picked_up` → `Dispatched`
- `in_transit` → `In Transit`
- `delivered` → `Received`

---

## 🧪 **Testing the Integration**

### **1. Start Backend Server**
```bash
cd backend
npm start
```
Server should run on `http://localhost:5000`

### **2. Start Frontend Development Server**
```bash
cd trackwell-system
npm run dev
```
Frontend should run on `http://localhost:5173`

### **3. Test API Connection**
```javascript
// In browser console or test component
import { testAPIConnection } from '@/lib/test-api';
await testAPIConnection();
```

### **4. Test Endpoints**

#### **Health Check**
```bash
curl http://localhost:5000/api/health
```

#### **Get Shipments**
```bash
curl http://localhost:5000/api/shipments
```

#### **Create Shipment**
```bash
curl -X POST http://localhost:5000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "parcelIds": ["parcel_id_1"],
    "originHub": "HYD",
    "destinationHub": "BLR",
    "expectedArrival": "2026-04-20T10:00:00Z"
  }'
```

---

## 🛠 **Development Setup**

### **Prerequisites**
1. Backend server running on port 5000
2. Frontend development server running on port 5173
3. MongoDB connection configured in backend
4. Authentication temporarily disabled for testing

### **Environment Variables**
```bash
# Backend (.env)
MONGO_URI=mongodb+srv://...
PORT=5000

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔍 **Debugging**

### **Common Issues**

#### **CORS Errors**
- Ensure backend has CORS middleware
- Frontend and backend on different ports should work with CORS

#### **Authentication Errors**
- Authentication is temporarily disabled
- Check `src/modules/*/routes.js` for commented auth middleware

#### **TypeScript Errors**
- Check `src/lib/api.d.ts` for type definitions
- Ensure API responses match expected types

#### **Network Errors**
- Verify backend server is running
- Check firewall settings
- Verify API endpoints are correct

### **Debug Tools**

#### **Browser DevTools**
```javascript
// Check API calls in Network tab
// Look for failed requests in Console

// Test API manually
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);
```

#### **API Interceptors**
The API instance includes request/response interceptors for logging:
```javascript
// Logs all API requests and responses
// Check browser console for detailed logs
```

---

## 📊 **Data Flow**

```
Frontend Component
    ↓ (API call)
API Service (src/lib/api.js)
    ↓ (HTTP request)
Backend Server (port 5000)
    ↓ (Database query)
MongoDB
    ↓ (Response)
Backend Server
    ↓ (HTTP response)
Frontend Component
```

---

## 🚨 **Important Notes**

### **Authentication**
- Currently disabled for testing
- Will be re-enabled once JWT tokens are implemented
- Role-based access will be enforced

### **Error Handling**
- All API calls wrapped in try-catch
- Consistent error format across endpoints
- User-friendly error messages

### **Data Validation**
- Backend validates all incoming data
- Frontend should validate before sending
- Zod schemas for validation

### **Performance**
- API requests have 10-second timeout
- Response interceptors for logging
- Pagination for large datasets

---

## 🔄 **Next Steps**

1. **Re-enable Authentication** - Add JWT token handling
2. **Implement Real-time Updates** - WebSocket integration
3. **Add Error Boundaries** - Better error handling in UI
4. **Optimize Caching** - Implement response caching
5. **Add Loading States** - Better UX for async operations

---

## 📞 **Support**

For integration issues:
1. Check browser console for errors
2. Verify backend server is running
3. Test endpoints with curl/Postman
4. Check network connectivity
5. Review this documentation

---

## ✅ **Verification Checklist**

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] API health check returns 200
- [ ] Shipments load in admin dashboard
- [ ] Customer dashboard shows data
- [ ] No CORS errors in browser
- [ ] TypeScript compilation successful
- [ ] API calls logged in console

---

**Last Updated**: April 17, 2026
**Version**: 1.0.0
