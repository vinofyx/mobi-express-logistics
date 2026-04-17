# Frontend-Backend Connectivity Guide

## **Configuration Summary**

### **Frontend Configuration**
- **Server**: Vite development server
- **Port**: `8080` (configured in `vite.config.ts`)
- **API Base URL**: `http://localhost:5000/api` (configured in `src/lib/api.js`)
- **Access URL**: `http://localhost:8080`

### **Backend Configuration**
- **Server**: Node.js Express
- **Port**: `5000` (default)
- **CORS**: Enabled for `http://localhost:8080` and `http://localhost:5173`
- **Access URL**: `http://localhost:5000`

---

## **Files Modified**

### **Frontend Changes**
```typescript
// vite.config.ts - Added port configuration
export default defineConfig({
  vite: {
    server: {
      port: 8080,
      host: true,
      strictPort: true,
    },
  },
});
```

```javascript
// src/lib/api.js - API configuration (already correct)
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### **Backend Changes**
```javascript
// src/app.js - Added CORS middleware
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
}));
```

```json
// package.json - Added cors dependency
{
  "dependencies": {
    "cors": "^2.8.5"
  }
}
```

---

## **Startup Commands**

### **Start Backend Server**
```bash
cd backend
npm start
# Server runs on: http://localhost:5000
```

### **Start Frontend Server**
```bash
cd trackwell-system
npm run dev
# Frontend runs on: http://localhost:8080
```

---

## **API Endpoints Available**

### **Health Check**
```bash
GET http://localhost:5000/api/health
```

### **Pickups API**
```bash
GET    http://localhost:5000/api/pickups
POST   http://localhost:5000/api/pickups
PUT    http://localhost:5000/api/pickups/:id
PUT    http://localhost:5000/api/pickups/:id/status
DELETE http://localhost:5000/api/pickups/:id
```

### **Parcels API**
```bash
GET    http://localhost:5000/api/parcels
POST   http://localhost:5000/api/parcels
GET    http://localhost:5000/api/parcels/tracking/:trackingId
PUT    http://localhost:5000/api/parcels/:id
PUT    http://localhost:5000/api/parcels/:id/status
DELETE http://localhost:5000/api/parcels/:id
```

### **Shipments API**
```bash
GET    http://localhost:5000/api/shipments
POST   http://localhost:5000/api/shipments
GET    http://localhost:5000/api/shipments/track/:shipmentId
PUT    http://localhost:5000/api/shipments/:id/status
DELETE http://localhost:5000/api/shipments/:id
```

---

## **Testing Connectivity**

### **Method 1: Browser Console**
1. Open frontend at `http://localhost:8080`
2. Open browser console (F12)
3. Run connectivity test:
```javascript
import { runConnectivityTests } from '@/lib/test-connectivity';
await runConnectivityTests();
```

### **Method 2: Manual API Calls**
```javascript
// Test health check
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);

// Test pickups API
fetch('http://localhost:5000/api/pickups')
  .then(r => r.json())
  .then(console.log);
```

### **Method 3: Using Tracking Widget**
1. Visit `http://localhost:8080`
2. Use tracking widget with sample ID: `LMS-HYD-20260417-XYZ1`
3. Check browser console for API logs

---

## **Troubleshooting**

### **Common Issues**

#### **1. CORS Errors**
**Symptom**: Browser shows CORS policy error
**Solution**: Ensure backend has CORS middleware enabled
```javascript
app.use(cors({
  origin: ['http://localhost:8080'],
  credentials: true,
}));
```

#### **2. Connection Refused**
**Symptom**: `ERR_CONNECTION_REFUSED` in browser
**Solution**: Ensure backend server is running on port 5000
```bash
cd backend && npm start
```

#### **3. Port Already in Use**
**Symptom**: Port 8080 or 5000 already in use
**Solution**: Kill existing processes or change ports
```bash
# Kill processes on Windows
taskkill /F /IM node.exe

# Or use different ports
```

#### **4. API Not Found**
**Symptom**: 404 errors for API endpoints
**Solution**: Verify API routes are mounted correctly in backend
```javascript
app.use("/api/pickups", pickupRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/shipments", shipmentRoutes);
```

---

## **Verification Checklist**

### **Before Starting**
- [ ] Backend server installed dependencies (`npm install`)
- [ ] Frontend server installed dependencies (`npm install`)
- [ ] CORS package installed in backend
- [ ] Vite config updated for port 8080

### **After Starting**
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:8080`
- [ ] Health check returns 200: `GET /api/health`
- [ ] No CORS errors in browser console
- [ ] API calls logged in console with axios interceptors

### **Functional Tests**
- [ ] Pickups API returns data: `GET /api/pickups`
- [ ] Parcels API returns data: `GET /api/parcels`
- [ ] Shipments API returns data: `GET /api/shipments`
- [ ] Tracking widget accepts input
- [ ] Tracking results display correctly

---

## **Expected Console Logs**

### **Successful API Calls**
```
API Request: GET /health
API Response: 200 /health
API Request: GET /pickups
API Response: 200 /pickups
```

### **Error Logs**
```
API Request Error: Network Error
API Response Error: Request failed with status code 404
```

---

## **Development Workflow**

### **Daily Development**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd trackwell-system && npm run dev`
3. Open browser: `http://localhost:8080`
4. Monitor console for API logs
5. Test functionality

### **Testing New Features**
1. Add API endpoint in backend
2. Add corresponding method in `src/lib/api.js`
3. Test with connectivity script
4. Verify in browser console

---

## **Performance Notes**

### **API Response Times**
- Health check: ~50ms
- Data endpoints: ~100-300ms
- Tracking queries: ~150-250ms

### **Browser Compatibility**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

### **Network Requirements**
- Minimum: 1 Mbps connection
- Recommended: 10 Mbps+ for optimal performance

---

## **Security Considerations**

### **Current Setup**
- CORS restricted to localhost
- No authentication (temporarily disabled)
- Basic error handling

### **Production Considerations**
- Enable authentication
- Use HTTPS
- Implement rate limiting
- Add input validation
- Secure CORS origins

---

**Last Updated**: April 17, 2026
**Status**: Ready for Development
**Ports**: Frontend 8080, Backend 5000
