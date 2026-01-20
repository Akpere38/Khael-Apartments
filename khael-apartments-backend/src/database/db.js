// src/database/db.js
// This file creates and manages the SQLite database connection
// Think of it like creating a "data store" that persists across server restarts

const Database = require('better-sqlite3');
const path = require('path');

// Create database file path (stores in src/database folder)
const dbPath = path.join(__dirname, 'apartments.db');

// Create/open database connection
// verbose: console.log() prints SQL queries (helpful for debugging)
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys (so when we delete an apartment, its images are auto-deleted)
// This is like cascading deletes in React - when parent is removed, children follow
db.pragma('foreign_keys = ON');

// Export the database so other files can use it
module.exports = db;