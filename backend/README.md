# Logistics Management System — Backend API

Node.js + Express + MongoDB REST API with JWT authentication and role-based access control.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| MongoDB | 6.x (local) or a MongoDB Atlas connection string |

---

## Quick start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd lms-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```env
MONGO_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
```

Generate strong secrets quickly:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run in development

```bash
npm run dev
```

The server starts on **http://localhost:5000** with hot-reload via `nodemon`.

### 4. Run in production

```bash
NODE_ENV=production npm start
```

### 5. Run tests

```bash
npm test
```

---

## Project structure

```
src/
├── config/         # DB connection, role constants
├── modules/        # Feature modules (auth, users, customers, pickups, parcels, shipments)
│   └── <module>/
│       ├── *.model.js       # Mongoose schema
│       ├── *.controller.js  # Request → service → response
│       ├── *.validator.js   # Joi validation schemas
│       └── *.routes.js      # Express router
├── middleware/     # authenticate, authorize, validate, errorHandler
├── shared/
│   ├── utils/      # catchAsync, apiResponse, paginate
│   └── constants/  # status enums
├── app.js          # Express setup, middleware stack, route mounting
└── server.js       # HTTP listen + graceful shutdown
```

---

## API reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <access_token>
```

### Roles
| Role | Value |
|---|---|
| Admin | `admin` |
| Operations Manager | `operations_manager` |
| Field Agent | `field_agent` |
| Center Staff | `center_staff` |
| Hub Staff | `hub_staff` |

---

### Auth endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a new user account |
| POST | `/auth/login` | Public | Login, receive access + refresh tokens |
| POST | `/auth/refresh-token` | Cookie | Issue a new access token |
| POST | `/auth/logout` | Cookie | Clear refresh token cookie |

**Register body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@lms.com",
  "password": "SecurePass123",
  "role": "center_staff"
}
```

**Login body:**
```json
{ "email": "ravi@lms.com", "password": "SecurePass123" }
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJ...",
    "user": { "id": "...", "name": "Ravi Kumar", "email": "ravi@lms.com", "role": "center_staff" }
  }
}
```

---

### Users endpoints (admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Get own profile |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user details |
| PATCH | `/users/:id/role` | Change user role |
| PATCH | `/users/:id/toggle-active` | Activate / deactivate account |

---

### Customers endpoints

| Method | Path | Allowed roles | Description |
|---|---|---|---|
| GET | `/customers` | All | List customers (paginated) |
| POST | `/customers` | admin, ops_manager, center_staff | Create customer |
| GET | `/customers/:id` | All | Get customer |
| PATCH | `/customers/:id` | admin, ops_manager, center_staff | Update customer |
| DELETE | `/customers/:id` | admin | Soft delete |

**Query params:** `?page=1&limit=20&search=ravi`

---

### Pickups endpoints

| Method | Path | Allowed roles | Description |
|---|---|---|---|
| GET | `/pickups` | All | List pickups |
| POST | `/pickups` | admin, ops_manager, center_staff | Create pickup request |
| GET | `/pickups/:id` | All | Get pickup |
| PATCH | `/pickups/:id` | admin, ops_manager, center_staff | Update pickup details |
| PATCH | `/pickups/:id/assign` | admin, ops_manager | Assign field agent |
| PATCH | `/pickups/:id/status` | admin, ops_manager, center_staff, field_agent | Update status |
| DELETE | `/pickups/:id` | admin, ops_manager | Delete (Requested only) |

**Status flow:** `Requested → Assigned → Picked` or `→ Failed`

**Assign body:**
```json
{ "agentId": "<user_id>" }
```

**Status body:**
```json
{ "status": "Picked", "note": "Collected 3 parcels." }
```

---

### Parcels endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/parcels/track/:trackingId` | **Public** | Track parcel by ID |
| GET | `/parcels` | All | List parcels |
| POST | `/parcels` | admin, ops_manager, center_staff | Add parcel |
| GET | `/parcels/:id` | All | Get parcel |
| PATCH | `/parcels/:id` | admin, ops_manager, center_staff | Update parcel |
| PATCH | `/parcels/:id/status` | admin, ops_manager, center_staff, hub_staff | Update status |
| DELETE | `/parcels/:id` | admin | Delete (Pending only) |

**Status flow:** `Pending → In Pickup → At Center → In Transit → Delivered` or `→ Returned`

**Tracking ID format:** `LMS-<timestamp_base36>-<random>` e.g. `LMS-LQXK12-AB3C`

---

### Shipments endpoints

| Method | Path | Allowed roles | Description |
|---|---|---|---|
| GET | `/shipments` | All | List shipments |
| POST | `/shipments` | admin, ops_manager | Create shipment batch |
| GET | `/shipments/:id` | All | Get shipment |
| POST | `/shipments/:id/parcels` | admin, ops_manager, hub_staff | Add parcels |
| PATCH | `/shipments/:id/status` | admin, ops_manager, hub_staff | Update status |
| DELETE | `/shipments/:id` | admin | Delete (Dispatched only) |

**Status flow:** `Dispatched → In Transit → Received`

When status reaches **Received**, all linked parcels are automatically marked **Delivered**.

**Create body:**
```json
{
  "parcelIds": ["<parcel_id_1>", "<parcel_id_2>"],
  "originHub": "Hyderabad Center",
  "destinationHub": "Mumbai Hub",
  "route": ["Pune Hub"],
  "expectedArrival": "2026-04-20T10:00:00.000Z"
}
```

---

## Standard response envelope

```json
{
  "success": true,
  "message": "Descriptive message.",
  "data": { },
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6,
    "hasNext": true
  }
}
```

Errors follow the same shape with `success: false` and an appropriate HTTP status code.

---

## Environment variables reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | HTTP port |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Access token signing secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access token expiry |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiry |
| `CLIENT_URL` | No | `http://localhost:3000` | Allowed CORS origin |
