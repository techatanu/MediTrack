const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body || {};
    const displayName = (name || username || "").trim();
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: displayName, email: normalizedEmail, password: hash });

    const token = signToken(user._id);
    return res.status(201).json({
      message: "User created",
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id);
    return res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = router;

VITE_API_BASE_URL=http://127.0.0.1:5000/api