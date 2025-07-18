const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/auth");

// @route   POST /api/bookings
// @desc    Create a new service booking
// @access  Private (User only)
router.post("/", protect, authorize("user"), async (req, res) => {
  const { serviceId, date, time, phoneNumber, address } = req.body;

  try {
    const booking = new Booking({
      user: req.user._id,
      service: serviceId,
      date: new Date(date),
      time,
      phoneNumber, // New field
      address, // New field
      status: "Pending", // Default status
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for the logged-in user
// @access  Private (User only)
router.get("/my-bookings", protect, authorize("user"), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service", "name")
      .populate("worker", "name"); // Populate service and worker details
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
