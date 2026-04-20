// backend/scripts/setAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'admin@tirthsaathi.local'; // change if different
  const u = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { isAdmin: true, role: 'admin' } },
    { new: true }
  );
  if (!u) {
    console.log('Admin user not found for', email);
  } else {
    console.log('Updated user to admin:', u.email, 'isAdmin=', u.isAdmin, 'role=', u.role);
  }
  await mongoose.disconnect();
}
main().catch(err => { console.error(err); process.exit(1); });
