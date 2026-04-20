// backend/scripts/fixAdminFields.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // If there are old lowercase fields, set camelCase isAdmin
  const res1 = await User.updateMany(
    { isadmin: { $exists: true, $eq: true } },
    { $set: { isAdmin: true } }
  );
  console.log('isadmin->isAdmin updates:', res1.modifiedCount);

  // Set isAdmin:true and role:'admin' for the seeded admin email
  const email = 'admin@tirthsaathi.local';
  const u = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { isAdmin: true, role: 'admin' } },
    { new: true, upsert: false }
  );

  if (!u) console.log('Admin user not found:', email);
  else console.log('Updated user to admin:', u.email, 'isAdmin=', u.isAdmin, 'role=', u.role);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
