// src/middleware/auth.js
// This is like a "guard" component in React Router
// It checks if the user is authenticated before allowing access to protected routes

const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * 
 * How it works (similar to React context/state):
 * 1. Frontend sends a token in the request header
 * 2. We verify the token is valid
 * 3. If valid, allow the request to continue
 * 4. If invalid, send error response
 * 
 * Think of it like: if (!isLoggedIn) return <Redirect to="/login" />
 */
function authenticateAdmin(req, res, next) {
  try {
    // Get token from Authorization header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization token provided',
        message: 'Please login first'
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'Token should be: Bearer <token>'
      });
    }

    // Verify token using secret key
    // This is like checking if a password hash matches
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object (so routes can access it)
    // Like setting state that's accessible to child components
    req.admin = {
      id: decoded.id,
      username: decoded.username
    };

    // Continue to the actual route handler
    next();

  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Please login again'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again'
      });
    }

    // Other errors
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message
    });
  }
}

module.exports = { authenticateAdmin };