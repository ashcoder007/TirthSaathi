// backend/routes/admin.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware'); // your existing file
const isAdmin = require('../middleware/isAdmin');

const Place = require('../models/Place');
const Event = require('../models/Event');
const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Accept either explicit isAdmin flag or role === 'admin'
    const adminFlag = !!user.isAdmin || user.role === 'admin';
    if (!adminFlag) return res.status(403).json({ message: 'Not an admin' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: adminFlag ? 'admin' : user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: !!user.isAdmin
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('admin login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// Optional: import a rate limiter if you have one
// const rateLimiter = require('../middleware/rateLimiter');

// ----------------- PLACES -----------------

// List all places (admin)
router.get('/places', auth, isAdmin, async (req, res) => {
  try {
    const places = await Place.find().sort({ name: 1 });
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Create place
router.post('/places', auth, isAdmin, async (req, res) => {
  try {
    const payload = req.body;
    const place = await Place.create(payload);
    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

// Update place
router.put('/places/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// Delete place
router.delete('/places/:id', auth, isAdmin, async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: 'Place deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

// ----------------- EVENTS -----------------

router.get('/events', auth, isAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.place) filter.place = req.query.place;
    const events = await Event.find(filter).populate('place').sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/events', auth, isAdmin, async (req, res) => {
  try {
    const ev = await Event.create(req.body);
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/events/:id', auth, isAdmin, async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/events/:id', auth, isAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ----------------- ACCOMMODATIONS -----------------

router.get('/accommodations', auth, isAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.place) filter.place = req.query.place;
    const acc = await Accommodation.find(filter).populate('place').sort({ name: 1 });
    res.json(acc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

router.post('/accommodations', auth, isAdmin, async (req, res) => {
  try {
    const a = await Accommodation.create(req.body);
    res.json(a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create accommodation' });
  }
});

router.put('/accommodations/:id', auth, isAdmin, async (req, res) => {
  try {
    const a = await Accommodation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update accommodation' });
  }
});

router.delete('/accommodations/:id', auth, isAdmin, async (req, res) => {
  try {
    await Accommodation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Accommodation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete accommodation' });
  }
});

// ----------------- USERS (admin view) -----------------

router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users/:id/promote', auth, isAdmin, async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true }).select('-password');
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// ----------------- SEED TEST DATA (admin-only) -----------------

router.post('/seed-test-data', auth, isAdmin, async (req, res) => {
  try {
    // sample seed similar to earlier; for brevity keep it short here
    const codes = ['VAR', 'HAR', 'UJJ', 'RSH'];
    await Place.deleteMany({ code: { $in: codes } });

    const places = [
      { code: 'VAR', name: 'Varanasi', description: 'Ancient city on the Ganges.', coords: { lat: 25.3176, lng: 82.9739 }, languages: ['en','hi'] },
      { code: 'HAR', name: 'Haridwar', description: 'Pilgrimage city in Uttarakhand.', coords: { lat: 29.9457, lng: 78.1642 }, languages: ['en','hi'] },
      { code: 'UJJ', name: 'Ujjain', description: 'City famous for Mahakumbh and temples.', coords: { lat: 23.1793, lng: 75.7847 }, languages: ['en','hi'] },
      { code: 'RSH', name: 'Rishikesh', description: 'Riverside pilgrimage and yoga hub.', coords: { lat: 30.0869, lng: 78.2676 }, languages: ['en','hi'] }
    ];

    const createdPlaces = await Place.insertMany(places);
    const byCode = (c) => createdPlaces.find(p => p.code === c)._id;

    const events = [
      { place: byCode('VAR'), title: 'Ganga Aarti', description: 'Evening Ganga Aarti at Dashashwamedh Ghat', startDate: new Date(), endDate: new Date(), locationDesc: 'Dashashwamedh Ghat', tags: ['aarti'] },
      { place: byCode('HAR'), title: 'Har Ki Pauri Aarti', description: 'Holy evening aarti at Har Ki Pauri', startDate: new Date(), endDate: new Date(), locationDesc: 'Har Ki Pauri', tags: ['aarti'] },
      { place: byCode('UJJ'), title: 'Mahadev Puja', description: 'Special puja in the Mahakaleshwar temple', startDate: new Date(), endDate: new Date(), locationDesc: 'Mahakaleshwar Temple', tags: ['puja'] },
      { place: byCode('RSH'), title: 'Yoga Satsang', description: 'Morning yoga and satsang by the river', startDate: new Date(), endDate: new Date(), locationDesc: 'Parmarth Niketan', tags: ['yoga'] }
    ];

    await Event.insertMany(events);

    const accommodations = [
      { place: byCode('VAR'), name: 'Varanasi Guest House', type: 'homestay', address: 'Near Dashashwamedh', phone: '9999999991', priceRange: '₹1000-2000', available: true, coords: { lat: 25.316, lng: 82.97 } },
      { place: byCode('HAR'), name: 'Haridwar Dharmshala', type: 'dharmshala', address: 'Near Har Ki Pauri', phone: '9999999981', priceRange: '₹300-800', available: true, coords: { lat: 29.945, lng: 78.164 } },
      { place: byCode('UJJ'), name: 'Ujjain Stay Home', type: 'homestay', address: 'Near Mahakaleshwar', phone: '9999999971', priceRange: '₹800-1500', available: true, coords: { lat: 23.18, lng: 75.785 } },
      { place: byCode('RSH'), name: 'Rishikesh Guest House', type: 'homestay', address: 'Near Ram Jhula', phone: '9999999961', priceRange: '₹700-1400', available: true, coords: { lat: 30.086, lng: 78.267 } }
    ];

    await Accommodation.insertMany(accommodations);

    return res.json({ message: 'Seeded test data' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Seeding failed' });
  }
});

module.exports = router;
