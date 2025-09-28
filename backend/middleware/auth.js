const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log(`Auth middleware: Received request to ${req.method} ${req.originalUrl}`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  console.log('Auth middleware: Token found.');

  try {
    console.log('Auth middleware: Attempting to verify token.');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Decoded token:', decoded);
    
    // Ensure the user object has the correct structure
    req.user = {
      userId: decoded.userId,
      ...decoded
    };
    
    console.log('Auth middleware: Token verified successfully for user ID:', req.user.userId);
    console.log('Auth middleware: req.user object before next():', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware: Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    res.status(403).json({ message: 'Invalid token.' });
  }
};