require("dotenv").config();

const express       = require("express");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");
const connectDB     = require("./config/db");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes     = require("./modules/auth/auth.routes");
const userRoutes     = require("./modules/users/user.routes");
const customerRoutes = require("./modules/customers/customer.routes");
const pickupRoutes   = require("./modules/pickups/pickup.routes");
const parcelRoutes   = require("./modules/parcels/parcel.routes");
const shipmentRoutes = require("./modules/shipments/shipment.routes");
const trackingRoutes = require("./modules/tracking/tracking.routes");

connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/",          (_, res) => res.json({ success: true, message: "MobiExpress API v1.0" }));
app.get("/health",    (_, res) => res.json({ success: true, message: "Server is healthy" }));
app.get("/api",       (_, res) => res.json({ success: true, message: "API is running", version: "1.0", endpoints: ["/api/auth", "/api/users", "/api/customers", "/api/pickups", "/api/parcels", "/api/shipments", "/api/tracking"] }));
app.get("/api/test",  (_, res) => res.json({ success: true, message: "API test endpoint working" }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/pickups",   pickupRoutes);
app.use("/api/parcels",   parcelRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/tracking",  trackingRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Unexpected server error." });
});

module.exports = app;

