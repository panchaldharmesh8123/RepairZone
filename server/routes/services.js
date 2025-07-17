const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/services
// @desc    Add a new service
// @access  Private (Admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  const { name, iconPath, description } = req.body;

  try {
    const service = new Service({
      name,
      iconPath,
      description,
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
