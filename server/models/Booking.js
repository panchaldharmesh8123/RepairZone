const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // e.g., "09:00 AM"
    required: true,
  },
   phoneNumber: { // New field
    type: String,
    required: true,
  },
  address: { // New field
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Rejected'],
    default: 'Pending',
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencing the User model, where role would be 'worker'
    required: false, // Worker assigned after confirmation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);