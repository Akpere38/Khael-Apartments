// src/routes/auth.js
// These are the authentication endpoints
// Think of this like defining routes in React Router

const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');

/**
 * POST /api/admin/login
 * Public route - anyone can access
 * 
 * Request body:
 * {
 *   "username": "admin",
 *   "password": "your-password"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR...",
 *   "admin": { "id": 1, "username": "admin" }
 * }
 */
router.post('/login', login);

/**
 * GET /api/admin/verify
 * Protected route - requires valid token
 * 
 * Headers required:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "admin": { "id": 1, "username": "admin" }
 * }
 */
router.get('/verify', authenticateAdmin, verifyToken);

module.exports = router;