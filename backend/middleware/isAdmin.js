// backend/middleware/isAdmin.js
module.exports = (req, res, next) => {
  // authmiddleware already sets req.user
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};
