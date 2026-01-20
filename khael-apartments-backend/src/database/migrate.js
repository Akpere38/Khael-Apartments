// src/database/migrate.js
// Run this ONCE to add new columns to existing database

const db = require('./db');

function migrate() {
  console.log('🔄 Running database migration...');

  try {
    // Check if columns already exist
    const tableInfo = db.prepare('PRAGMA table_info(apartments)').all();
    const columnNames = tableInfo.map(col => col.name);

    // Add featured column if it doesn't exist
    if (!columnNames.includes('featured')) {
      db.exec('ALTER TABLE apartments ADD COLUMN featured INTEGER DEFAULT 0');
      console.log('✅ Added "featured" column');
    }

    // Add amenities column if it doesn't exist
    if (!columnNames.includes('amenities')) {
      db.exec('ALTER TABLE apartments ADD COLUMN amenities TEXT');
      console.log('✅ Added "amenities" column');
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

migrate();