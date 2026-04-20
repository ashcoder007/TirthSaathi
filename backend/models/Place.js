const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    description: String,
    coords: { lat: Number, lng: Number }, // center
    languages: [String],

    // ✅ add this
    showInMaps: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", PlaceSchema);