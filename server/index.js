const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

// Load .env file from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });
console.log("🔍 MONGO_URI:", process.env.MONGO_URI);

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Welcome to NepWay API - Ride the Nepali Way! ✅");
});

// 🧪 Test route for debugging
app.get("/test", (req, res) => {
  res.json({ message: "NepWay API is working!", timestamp: new Date() });
});

// ✨ Your routes
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const rideRequestRoutes = require("./routes/rideRequestRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const driverRoutes = require("./routes/driverRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/ride-requests", rideRequestRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log("🚀 Server is running on http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
  });
