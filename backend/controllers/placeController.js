const Place = require("../models/Place");

// Public: places enabled for maps
exports.getPlacesForMaps = async (req, res) => {
  try {
    const places = await Place.find({ showInMaps: true }).sort({ name: 1 });
    res.json(places);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Admin: toggle showInMaps
exports.setShowInMaps = async (req, res) => {
  try {
    const { id } = req.params;
    const { showInMaps } = req.body;

    const place = await Place.findByIdAndUpdate(
      id,
      { showInMaps: !!showInMaps },
      { new: true }
    );

    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};