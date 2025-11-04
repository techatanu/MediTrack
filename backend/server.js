const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Request logger (helps see why requests get 403)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers && { origin: req.headers.origin, "content-type": req.headers["content-type"] });
  if (req.body) console.log("Body:", req.body);
  next();
});

// Import routes (use lowercase file name to avoid case issues)
const authRoutes = require("./routes/Auth");
app.use("/api/auth", authRoutes);

// Health route
app.get("/", (req, res) => res.send("API is running..."));

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}
const masked = process.env.MONGO_URI.replace(/:(.*)@/, ':****@');
console.log("Attempting MongoDB connection to:", masked);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message || err);
    process.exit(1);
  });

// Generic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
// bind to IPv4 localhost to avoid hitting macOS AirPlay on ::1
app.listen(PORT, "127.0.0.1", () => console.log(`🚀 Server running on port ${PORT}`));
