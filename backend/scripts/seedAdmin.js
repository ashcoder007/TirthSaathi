// backend/scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'admin@tirthsaathi.local';
  const password = 'Admin@123'; // choose secure password
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  const admin = new User({
    name: 'Tirth Admin',
    email,
    password: hash,
    isAdmin: true,
    isVerified: true
  });
  await admin.save();
  console.log('Admin created:', email, 'password:', password);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
