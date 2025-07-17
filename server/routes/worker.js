const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

const User = require('../models/User'); // To associate worker
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/worker/requests
// @desc    Get all pending/confirmed service requests for workers
// @access  Private (Worker only)
router.get('/requests', protect, authorize('worker'), async (req, res) => {
  try {
    // A worker can view all pending requests, or requests confirmed to them
    const requests = await Booking.find({
      $or: [
        { status: 'Pending' },
        { status: 'Confirmed', worker: req.user._id },
        { status: 'In Progress', worker: req.user._id }
      ]
    })
      .populate('user', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 }); // Newest first
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/worker/requests/:id
// @desc    Update status of a service request (confirm, reject, in progress, complete)
// @access  Private (Worker only)
router.put('/requests/:id', protect, authorize('worker'), async (req, res) => {
  const { status } = req.body; // New status: 'Confirmed', 'Rejected', 'In Progress', 'Completed'

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow status changes that make sense for a worker
    if (['Confirmed', 'Rejected', 'In Progress', 'Completed'].includes(status)) {
      booking.status = status;
      if (status === 'Confirmed' && !booking.worker) {
        booking.worker = req.user._id; // Assign worker who confirms
      }
      // If a worker rejects, they might unassign themselves (optional logic)
      if (status === 'Rejected') {
          booking.worker = undefined; // Unassign worker
      }

      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(400).json({ message: 'Invalid status update' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;