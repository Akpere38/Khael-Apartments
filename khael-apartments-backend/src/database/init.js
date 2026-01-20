// src/database/init.js
// This file creates all database tables and the initial admin user
// Run this ONCE when the server first starts

const db = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Initialize Database Tables
 * Think of this like defining your React state structure, but permanent
 */
function initializeDatabase() {
  console.log('🗄️  Initializing database...');

  // Create apartments table
  // This is like defining: interface Apartment { id, title, bedrooms, ... }
  db.exec(`
    CREATE TABLE IF NOT EXISTS apartments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      max_guests INTEGER NOT NULL,
      price_per_night REAL NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      available INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      amenities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create apartment_images table
  // One apartment can have many images (one-to-many relationship)
  db.exec(`
    CREATE TABLE IF NOT EXISTS apartment_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
    )
  `);

  // Create apartment_videos table
  // Optional videos for apartments
  db.exec(`
    CREATE TABLE IF NOT EXISTS apartment_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id INTEGER NOT NULL,
      video_url TEXT NOT NULL,
      FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
    )
  `);

  // Create admin_users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables created successfully');

  // Create default admin user (only if none exists)
  createDefaultAdmin();
}

/**
 * Create Default Admin User
 * This runs automatically on first server start
 */
function createDefaultAdmin() {
  try {
    // Check if any admin exists
    const existingAdmin = db.prepare('SELECT * FROM admin_users LIMIT 1').get();

    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return;
    }

    // Get admin credentials from environment variables
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    // Hash the password (never store plain text passwords!)
    // This is like encrypting sensitive data before storing
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert admin user
    const stmt = db.prepare(`
      INSERT INTO admin_users (username, password)
      VALUES (?, ?)
    `);

    stmt.run(username, hashedPassword);

    console.log('✅ Default admin user created');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

/**
 * Add Sample Apartment (Optional - for testing)
 * Uncomment this if you want some initial data to work with
 */
function addSampleData() {
  try {
    // Check if apartments already exist
    const existingApartment = db.prepare('SELECT * FROM apartments LIMIT 1').get();
    
    if (existingApartment) {
      console.log('📦 Sample data already exists');
      return;
    }

    // Insert a sample apartment
    const stmt = db.prepare(`
      INSERT INTO apartments (
        title, description, bedrooms, bathrooms, max_guests,
        price_per_night, address, city, state, available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const apartmentId = stmt.run(
      'Luxury 2-Bedroom Apartment in Abuja',
      'Beautiful modern apartment with stunning city views. Fully furnished with high-speed internet, Smart TV, and modern kitchen appliances.',
      2,
      2,
      4,
      35000.00,
      '123 Cadastral Zone, Maitama',
      'Abuja',
      'FCT',
      1
    ).lastInsertRowid;

    // Add sample images (you can add real image URLs later)
    const imageStmt = db.prepare(`
      INSERT INTO apartment_images (apartment_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?)
    `);

    imageStmt.run(apartmentId, '/uploads/images/sample1.jpg', 1, 0);
    imageStmt.run(apartmentId, '/uploads/images/sample2.jpg', 0, 1);
    imageStmt.run(apartmentId, '/uploads/images/sample3.jpg', 0, 2);

    console.log('✅ Sample apartment added successfully');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  }
}

// Export the initialization function
module.exports = { initializeDatabase, addSampleData };