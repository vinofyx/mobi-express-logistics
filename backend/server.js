const express = require("express");
const connectDB = require("./db");

const app = express();

// connect database
connectDB();

app.get("/", (req, res) => {
  res.send("Server + MongoDB working 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
