// backend/routes/auth.js  (replace the POST /login handler)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
require('dotenv').config();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // ensure password is selected if schema hides it
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Normalize admin flag (accept isAdmin boolean or role string)
    const isAdmin = (user.isAdmin === true || String(user.role).toLowerCase() === 'admin');

    // Create JWT payload (include isAdmin and role)
    const payload = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: !!isAdmin,
      role: user.role || 'user'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    // Build sanitized user object to return
    const safeUser = {
      id: user._id.toString(),
      name: user.name || user.fullName || '',
      email: user.email,
      isAdmin: !!isAdmin,
      role: user.role || 'user'
    };

    // Send token + user object so frontend can check isAdmin reliably
    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
