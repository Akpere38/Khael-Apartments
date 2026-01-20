// src/controllers/authController.js
// This handles admin login logic
// Think of it like a form submit handler in React

const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Admin Login
 * 
 * Process (like a React form submission):
 * 1. Get username & password from request body
 * 2. Find admin user in database
 * 3. Compare password with stored hash
 * 4. If correct, generate a JWT token
 * 5. Send token back to frontend
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    // Find admin user in database
    const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (!admin) {
      // Don't reveal whether username exists (security best practice)
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Compare provided password with stored hash
    // bcrypt.compare is async, so we await it
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Generate JWT token (like creating a session)
    // Token expires in 24 hours
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send success response with token
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message
    });
  }
}

/**
 * Verify Token (optional endpoint to check if token is still valid)
 * Frontend can call this on app load to check if user is still logged in
 */
function verifyToken(req, res) {
  // If middleware passed, token is valid
  // req.admin was set by authenticateAdmin middleware
  res.json({
    success: true,
    message: 'Token is valid',
    admin: req.admin
  });
}

module.exports = {
  login,
  verifyToken
};