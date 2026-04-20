// backend/routes/places.js
const express = require("express");
const router = express.Router();
const Place = require("../models/Place");

const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// GET /api/places  (public)
router.get("/", async (req, res) => {
  try {
    const places = await Place.find().sort({ name: 1 });
    res.json(places);
  } catch (err) {
    console.error("GET /api/places error", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

// ✅ IMPORTANT: keep this BEFORE "/:id"
router.get("/maps", async (req, res) => {
  try {
    const places = await Place.find({ showInMaps: true }).sort({ name: 1 });
    res.json(places);
  } catch (err) {
    console.error("GET /api/places/maps error", err);
    res.status(500).json({ error: "Failed to fetch map places" });
  }
});

// GET /api/places/:id  (public)
router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json(place);
  } catch (err) {
    console.error("GET /api/places/:id error", err);
    res.status(500).json({ error: "Failed to fetch place" });
  }
});

// Admin: enable/disable place for maps
router.patch("/:id/show-in-maps", auth, adminOnly, async (req, res) => {
  try {
    const { showInMaps } = req.body;

    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { showInMaps: !!showInMaps },
      { new: true }
    );

    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json(place);
  } catch (err) {
    console.error("PATCH /api/places/:id/show-in-maps error", err);
    res.status(500).json({ error: "Failed to update showInMaps" });
  }
});

module.exports = router;