const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

// Helper to sign tokens
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, languagePref } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be 6+ chars' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({
      name, email, password: hashed, phone: phone || '', languagePref: languagePref || 'en'
    });

    await user.save();

    const token = signToken(user.id);
    // Optionally create refresh token cookie here

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, languagePref: user.languagePref }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, languagePref: user.languagePref }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authorized' });
  res.json({ user: req.user });
};
