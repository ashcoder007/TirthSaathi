// backend/models/User.js
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: {
    type: String, required: true, unique: true, lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6 },

  // NEW: admin + role fields
  isAdmin: { type: Boolean, default: false },   // camelCase is important
  role: { type: String, enum: ['user','admin'], default: 'user' },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
