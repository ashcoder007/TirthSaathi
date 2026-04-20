const mongoose = require('mongoose');
const AccSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  name: String,
  type: { type: String, enum:['hotel','homestay','dharmshala'] },
  address: String,
  phone: String,
  priceRange: String,
  available: Boolean,
  coords: { lat:Number, lng:Number }
}, { timestamps:true });
module.exports = mongoose.model('Accommodation', AccSchema);
