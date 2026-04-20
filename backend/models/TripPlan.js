const mongoose = require('mongoose');
const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  place: { type: mongoose.Schema.Types.ObjectId, ref:'Place' },
  startDate: Date,
  endDate: Date,
  selectedEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref:'Event' }],
  accommodationsBooked: [{ type: mongoose.Schema.Types.ObjectId, ref:'Accommodation' }],
  notes: String
}, { timestamps:true });
module.exports = mongoose.model('TripPlan', TripSchema);
