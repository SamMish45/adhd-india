const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── MongoDB connect ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err));

// ── Booking Schema ──
const bookingSchema = new mongoose.Schema({
  doctorName:  String,
  fee:         Number,
  patientId:   String,
  patientName: String,
  age:         Number,
  phone:       String,
  symptoms:    String,
  history:     String,
  appointmentTime: Date,
  createdAt:   { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// ── ROUTES ──

// 1. New booking banao (form submit pe)
app.post('/api/booking', async (req, res) => {
  try {
    const apptTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // +4 hours
    const booking = new Booking({ ...req.body, appointmentTime: apptTime });
    await booking.save();
    res.json({ success: true, bookingId: booking._id, appointmentTime: apptTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Sab bookings dekho (admin ke liye)
app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));