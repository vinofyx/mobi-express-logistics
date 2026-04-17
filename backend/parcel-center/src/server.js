const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀  Parcel Center API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  console.log(`📍  Health check: http://localhost:${PORT}/health`);
  console.log(`🔗  API endpoints: http://localhost:${PORT}/api/parcels/`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n⚡  ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("✅  HTTP server closed.");
    process.exit(0);
  });

  // Force exit if server hasn't closed within 10 seconds
  setTimeout(() => {
    console.error("❌  Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled rejection/exception guards
process.on("unhandledRejection", (reason) => {
  console.error("🔴  Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("🔴  Uncaught Exception:", err);
  process.exit(1);
});
