// backend/scripts/checkAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main(){
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@tirthsaathi.local' }).lean();
  console.log(user);
  await mongoose.disconnect();
}
main().catch(console.error);
