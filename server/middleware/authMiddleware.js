// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//   const token = req.cookies.token; // from cookie
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }
//     req.admin = decoded; // attach decoded info to request
//     next();
//   });
// };

// module.exports = authenticateToken;


// after chat system

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Admin = require('../models/Admin');

// const authenticateToken = async (req, res, next) => {
//   try {
//     // Get token from cookies or Authorization header
//     let token = req.cookies.token || 
//                req.headers.authorization?.split(' ')[1] || 
//                req.query.token;
    
//     if (!token) {
//       return res.status(401).json({ 
//         success: false,
//         error: 'Not authorized, no token provided' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Find user in either User or Admin collection based on role
//     let user;
//     if (decoded.role === 'admin' || decoded.role === 'registrar') {
//       user = await Admin.findById(decoded.id);
//     } else {
//       user = await User.findById(decoded.id || decoded.userId); // Supports both your User and Admin models
//     }

//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         error: 'Not authorized, user not found' 
//       });
//     }

//     // Attach user to request object
//     req.user = {
//       _id: user._id,
//       email: user.email,
//       role: user.role || 'user', // Default to 'user' if role not specified
//       // Add other relevant user properties
//       ...(user.orgIdNumber && { orgIdNumber: user.orgIdNumber }),
//       ...(user.firstName && { firstName: user.firstName }),
//       ...(user.lastName && { lastName: user.lastName })
//     };

//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     res.status(401).json({ 
//       success: false,
//       error: 'Not authorized, token failed' 
//     });
//   }
// };

// // Middleware for specific roles (admin/registrar)
// const roleMiddleware = (roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Not authorized for this action' 
//       });
//     }
//     next();
//   };
// };

// module.exports = { authenticateToken, roleMiddleware };



// Middleware for verifying regular user token
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Admin = require('../models/Admin');


// const authenticateUser = async (req, res, next) => {
//   try {
//     const token = req.cookies.token || 
//                  req.headers.authorization?.split(' ')[1];
    
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Try to find user in both collections
//     let user = await User.findById(decoded.id || decoded.userId);
//     let modelType = 'User';
    
//     if (!user) {
//       user = await Admin.findById(decoded.id || decoded.userId);
//       modelType = 'Admin';
//     }

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     // Attach the complete user document with additional metadata
//     req.user = {
//       ...user.toObject(), // Convert Mongoose doc to plain object
//       _id: user._id,
//       modelType,
//       role: user.role || 'user'
//     };

//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };


const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies.token ||
                 (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]);

    // Debug log
    console.log('Extracted token:', token);

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
    req.user.role = user.role || 'user';

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

// ✅ GOOD: You must fetch full Mongoose user document



module.exports = { authenticateUser, roleMiddleware };