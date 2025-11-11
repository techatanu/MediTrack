const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ---- CORS (allow Vite dev origins) ----
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin(origin, cb) {
    // allow same-origin or server-to-server (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle all preflight requests
app.use((req, res, next) => {
  // ensure caches don’t mix responses per origin
  res.setHeader("Vary", "Origin");
  next();
});

// Body parser
app.use(express.json());

// simple logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// routes

app.use("/api/auth", require("./routes/Auth"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

// DB + server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/meditrack";

async function start() {
  try {
    console.log("Connecting MongoDB:", MONGO_URI.replace(/:(.*)@/, ":****@"));
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Keep server running so frontend doesn't see "Network Error"
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
  });
}

start();
