// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not found in environment');
    process.exit(1);
  }

  // show masked URI so we know .env loaded correctly (do NOT print full password)
  const masked = uri.length > 40 ? uri.slice(0, 30) + '...' + uri.slice(-10) : uri;
  console.log('MONGO_URI (masked):', masked);
  console.log('Attempting to connect to MongoDB...');

  try {
    // modern connection - no deprecated options needed
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    // print detailed error for debugging (mask password if you paste it somewhere later)
    console.error('MongoDB connection error (full):', err);
    // Helpful: print a short summary about likely cause
    if (err.message && err.message.includes('querySrv')) {
      console.error('Note: querySrv / SRV DNS lookup failed. This often means a DNS or network issue (SRV lookup blocked), or wrong cluster name.');
    } else if (err.message && err.message.toLowerCase().includes('auth')) {
      console.error('Note: authentication error — check username/password in Atlas Database Access.');
    } else if (err.code === 'ECONNREFUSED' || err.message && err.message.includes('ECONNREFUSED')) {
      console.error('Note: connection refused — IP whitelisting, firewall/VPN, or cluster state may be the issue.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
