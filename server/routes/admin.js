const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// Middleware to ensure user is admin for all routes in this file
router.use(protect, authorize('admin'));

// --- User Management ---

// @route   GET /api/admin/users
// @desc    Get all users (including workers and other admins)
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Don't send passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user (admin can create any role)
// @access  Private (Admin only)
router.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = await User.create({ name, email, password, role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put('/users/:id', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    // Password update handled separately or by admin only if provided
    const updatedUser = await user.save();
    res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Service Management ---

// @route   GET /api/admin/services
// @desc    Get all services
// @access  Private (Admin only)
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/services
// @desc    Add a new service
// @access  Private (Admin only)
router.post('/services', async (req, res) => {
  const { name, iconPath, description } = req.body;
  try {
    const service = new Service({ name, iconPath, description });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/admin/services/:id
// @desc    Update a service
// @access  Private (Admin only)
router.put('/services/:id', async (req, res) => {
  const { name, iconPath, description } = req.body;
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    service.name = name || service.name;
    service.iconPath = iconPath || service.iconPath;
    service.description = description || service.description;
    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/services/:id
// @desc    Delete a service
// @access  Private (Admin only)
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Worker Management (Specific to users with role 'worker') ---

// @route   GET /api/admin/workers
// @desc    Get all users with role 'worker'
// @access  Private (Admin only)
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').populate('availableServices', 'name');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/workers
// @desc    Create a new worker (uses User model but sets role to 'worker')
// @access  Private (Admin only)
router.post('/workers', async (req, res) => {
    const { name, email, password, availableServices } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        user = await User.create({ name, email, password, role: 'worker', availableServices });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, availableServices: user.availableServices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/workers/:id
// @desc    Update a worker
// @access  Private (Admin only)
router.put('/workers/:id', async (req, res) => {
    const { name, email, availableServices } = req.body; // Password not updated here for simplicity
    try {
        const worker = await User.findById(req.params.id);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found or not a worker user' });
        }
        worker.name = name || worker.name;
        worker.email = email || worker.email;
        worker.availableServices = availableServices || worker.availableServices;
        const updatedWorker = await worker.save();
        res.json({ _id: updatedWorker._id, name: updatedWorker.name, email: updatedWorker.email, role: updatedWorker.role, availableServices: updatedWorker.availableServices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/workers/:id
// @desc    Delete a worker
// @access  Private (Admin only)
router.delete('/workers/:id', async (req, res) => {
    try {
        const worker = await User.findById(req.params.id);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found or not a worker user' });
        }
        await worker.deleteOne();
        res.json({ message: 'Worker removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;