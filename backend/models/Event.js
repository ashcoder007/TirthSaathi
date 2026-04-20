const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  locationDesc: String,
  tags: [String]
}, { timestamps:true });
module.exports = mongoose.model('Event', EventSchema);
