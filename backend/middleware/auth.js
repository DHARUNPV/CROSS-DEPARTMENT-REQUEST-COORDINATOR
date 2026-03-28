const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getOfficerById } = require('../data/officers');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');

    // Officer tokens are not backed by MongoDB.
    if (decoded.role === 'officer') {
      const officer = getOfficerById(decoded.officerId);
      if (!officer) return res.status(401).json({ message: 'Officer not found.' });
      req.user = {
        _id: officer.officerId,
        id: officer.officerId,
        officerId: officer.officerId,
        name: officer.name,
        email: officer.email,
        role: 'officer',
        department: officer.department,
        contact: officer.contact,
        area: officer.area,
      };
      return next();
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found.' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }
  next();
};

module.exports = { auth, requireRole };
