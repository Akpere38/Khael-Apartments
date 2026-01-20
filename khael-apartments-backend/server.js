// server.js
// This is like App.jsx but for the backend
// It sets up the server and connects all the routes

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, addSampleData } = require('./src/database/init');

// Import routes (we'll create these next)
const apartmentRoutes = require('./src/routes/apartments');
const authRoutes = require('./src/routes/auth');

// Create Express app (like creating your React app)
const app = express();

// Get port from environment or use 5000
const PORT = process.env.PORT || 5000;

// ===========================
// MIDDLEWARE (Think of these as "global hooks" that run before routes)
// ===========================

// 1. CORS - Allows frontend to communicate with backend
// Like saying "React app at localhost:5173 can talk to me"
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 2. JSON Parser - Converts incoming JSON to JavaScript objects
// Like automatically parsing JSON in fetch() responses
app.use(express.json());

// 3. URL-encoded Parser - Handles form submissions
app.use(express.urlencoded({ extended: true }));

// 4. Static Files - Serve uploaded images/videos
// Like the 'public' folder in React
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ===========================
// ROUTES (Like React Router routes)
// ===========================

// Health check route (to test if server is running)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Khael Apartments API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route handlers
app.use('/api/apartments', apartmentRoutes);
app.use('/api/admin', authRoutes);

// 404 handler - catches all undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler (catches any errors in routes)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===========================
// INITIALIZE DATABASE & START SERVER
// ===========================

// Initialize database tables and admin user
initializeDatabase();

// Uncomment this line to add sample data for testing
// addSampleData();

// Start the server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log(`   Khael Apartments API Server`);
  console.log('   ====================================');
  console.log(`   🌐 Server running on: http://localhost:${PORT}`);
  console.log(`   📝 API Base URL: http://localhost:${PORT}/api`);
  console.log(`   📁 Uploads folder: ${path.join(__dirname, 'src/uploads')}`);
  console.log(`   🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   ====================================');
  console.log('');
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});