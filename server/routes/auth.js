const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '3d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user, worker, or admin
// @access  Public (for initial user/worker), or Admin (for creating admins)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Basic role validation: only admin can register other admins
    if (role === 'admin') {
      // In a real app, you'd check if the registering user is already an admin
      // For simplicity, let's allow initial admin registration here if no admins exist
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin && req.user?.role !== 'admin') { // if an admin exists and request isn't by an admin
        return res.status(403).json({ message: 'Only an admin can register another admin' });
      }
    }

    user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // default to 'user' if not specified
    });
    console.log(`New user registered: ${user.email}`);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
      console.log(`User logged in: ${user.email}`);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;