// backend/routes/accommodations.js
const express = require("express");
const router = express.Router();
const Accommodation = require("../models/Accommodation");

// PUBLIC: GET accommodations by place
// /api/accommodations?place=PLACE_ID
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.place) {
      filter.place = req.query.place;
    }

    const accommodations = await Accommodation.find(filter)
      .select("name type priceRange address phone place");

    res.json(accommodations);
  } catch (err) {
    console.error("Public accommodations error", err);
    res.status(500).json({ error: "Failed to fetch accommodations" });
  }
});

module.exports = router;