require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const parcelRoutes = require("./routes/parcelRoutes");

// Connect database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (req, res) =>
  res.status(200).json({ success: true, message: "Parcel Center API is running." })
);

// API routes
app.use("/api/parcels", parcelRoutes);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
);

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Unexpected server error.", error: err.message });
});

module.exports = app;
