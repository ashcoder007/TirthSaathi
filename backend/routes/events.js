const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// PUBLIC: GET events by place
// /api/events?place=PLACE_ID
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.place) {
      filter.place = req.query.place;
    }

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .select('title startDate endDate locationDesc place')
      .populate('place', 'name');

    res.json(events);
  } catch (err) {
    console.error('Public events error', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;