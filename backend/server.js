const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const parcelRoutes = require("./src/modules/parcels/parcel.routes");
const shipmentRoutes = require("./src/modules/shipments/shipment.routes");
const pickupRoutes = require("./src/modules/pickups/pickup.routes");
const authRoutes = require("./src/modules/auth/auth.routes"); // ADD THIS

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect database
connectDB();

// simple test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Direct test route working!" });
});

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/pickups", pickupRoutes);

app.get("/", (req, res) => {
  res.send("Server + MongoDB working ");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
