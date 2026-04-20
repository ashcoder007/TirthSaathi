// backend/routes/adminEvents.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // your auth middleware
const isAdmin = require('../middleware/isAdmin');     // as created earlier
const Event = require('../models/Event');
const Place = require('../models/Place');
const { upload } = require('../utils/cloudinary');

// GET all events (admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const events = await Event.find().populate('place').sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET events by place query (optional)
router.get('/by-place/:placeId', auth, isAdmin, async (req, res) => {
  try {
    const events = await Event.find({ place: req.params.placeId }).sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events for place' });
  }
});

// CREATE event (multipart/form-data) - image optional
router.post('/', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    // expected fields: place, title, description, startDate, endDate, locationDesc, tags (json array or comma string)
    const { place, title, description, startDate, endDate, locationDesc, tags } = req.body;
    // ensure place exists
    const placeDoc = await Place.findById(place);
    if (!placeDoc) return res.status(400).json({ error: 'Invalid place id' });

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        parsedTags = String(tags).split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const ev = await Event.create({
      place,
      title,
      description,
      image: req.file?.path || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      locationDesc,
      tags: parsedTags
    });

    const populated = await ev.populate('place').execPopulate?.() ?? await Event.findById(ev._id).populate('place');
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// UPDATE event (multipart/form-data) - image optional (will replace)
router.put('/:id', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.tags) {
      try { updates.tags = JSON.parse(updates.tags); }
      catch (e) { updates.tags = String(updates.tags).split(',').map(t => t.trim()).filter(Boolean); }
    }
    if (req.file?.path) updates.image = req.file.path;
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const ev = await Event.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('place');
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
