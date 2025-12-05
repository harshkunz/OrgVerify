const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');


const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies.token ||
      (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]);

    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      return res.status(401).json({ message: 'Malformed or missing token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id || decoded.userId);
    let modelType = 'User';

    if (!user) {
      user = await Admin.findById(decoded.id || decoded.userId);
      modelType = 'Admin';
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.user.modelType = modelType;
    req.user.role = user.role || (modelType === 'Admin' ? 'admin' : 'user');

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { authenticateUser, roleMiddleware };
