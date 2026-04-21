require("dotenv").config();

const express        = require("express");
const cors           = require("cors");
const connectDB      = require("./config/db");

// Module-based pickup routes (replaces old routes/pickupRoutes)
const pickupRoutes   = require("./modules/pickups/pickup.routes");

// ✅ NEW: Parcel routes (IMPORTANT)
const parcelRoutes    = require("./modules/parcels/parcel.routes");

// ✅ NEW: Shipment routes
const shipmentRoutes  = require("./modules/shipments/shipment.routes");

// Customer routes
const customerRoutes  = require("./modules/customers/customer.routes");

// Auth routes
const authRoutes = require("./routes/authRoutes");

connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Root Route (fix "/" error) ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MobiExpress API Running 🚀"
  });
});

// ── API Test Route ───────────────────────────────────────────────────────────
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running successfully' 
  });
});

// ── API Root Route ───────────────────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({ 
    success: true, 
    message: 'API root working' 
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/customers", customerRoutes);
app.use("/api/pickups",    pickupRoutes);
app.use("/api/parcels",   parcelRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/auth",      authRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.status(200).json({ success: true, message: "API is running." })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Unexpected server error.",
    error: err.message
  });
});

module.exports = app;