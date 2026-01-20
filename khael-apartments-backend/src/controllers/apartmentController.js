// src/controllers/apartmentController.js
// This handles all apartment-related operations (CRUD)
// Think of these as event handlers in React that update state/database

const db = require('../database/db');
const fs = require('fs').promises;
const path = require('path');

/**
 * GET ALL APARTMENTS
 * Public - anyone can view apartments
 * Like fetching data in useEffect() and setting state
 */
function getAllApartments(req, res) {
  try {
    // Check if request is from admin (has Authorization header)
    const isAdmin = req.headers.authorization && req.headers.authorization.startsWith('Bearer');

    // If admin, show all apartments; if public, show only available ones
    const query = isAdmin 
      ? 'SELECT * FROM apartments ORDER BY created_at DESC'
      : 'SELECT * FROM apartments WHERE available = 1 ORDER BY created_at DESC';

    const apartments = db.prepare(query).all();

    // For each apartment, get its images and videos
    const apartmentsWithMedia = apartments.map(apt => {
      const images = db.prepare(`
        SELECT * FROM apartment_images 
        WHERE apartment_id = ? 
        ORDER BY is_primary DESC, display_order ASC
      `).all(apt.id);

      const videos = db.prepare(`
        SELECT * FROM apartment_videos 
        WHERE apartment_id = ?
      `).all(apt.id);

      return {
        ...apt,
        available: Boolean(apt.available),
        featured: Boolean(apt.featured),
        amenities: apt.amenities ? JSON.parse(apt.amenities) : [],
        images,
        videos
      };
    });

    res.json({
      success: true,
      count: apartmentsWithMedia.length,
      apartments: apartmentsWithMedia
    });

  } catch (error) {
    console.error('Error fetching apartments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch apartments',
      message: error.message
    });
  }
}

/**
 * GET SINGLE APARTMENT BY ID
 * Public - anyone can view apartment details
 */
function getApartmentById(req, res) {
  try {
    const { id } = req.params;

    // Get apartment details
    const apartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);

    if (!apartment) {
      return res.status(404).json({ 
        error: 'Apartment not found',
        message: `No apartment found with ID: ${id}`
      });
    }

    // Get images
    const images = db.prepare(`
      SELECT * FROM apartment_images 
      WHERE apartment_id = ? 
      ORDER BY is_primary DESC, display_order ASC
    `).all(id);

    // Get videos
    const videos = db.prepare(`
      SELECT * FROM apartment_videos 
      WHERE apartment_id = ?
    `).all(id);

    res.json({
      success: true,
      apartment: {
        ...apartment,
        available: Boolean(apartment.available),
        featured: Boolean(apartment.featured),
        amenities: apartment.amenities ? JSON.parse(apartment.amenities) : [],
        images,
        videos
      }
    });

  } catch (error) {
    console.error('Error fetching apartment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch apartment',
      message: error.message
    });
  }
}

/**
 * CREATE NEW APARTMENT
 * Protected - admin only
 * Like adding a new item to an array in state
 */
function createApartment(req, res) {
  try {
    const {
      title,
      description,
      bedrooms,
      bathrooms,
      max_guests,
      price_per_night,
      address,
      city,
      state,
      available = true,
      featured = false,
      amenities = []
    } = req.body;

    // Validate required fields
    if (!title || !bedrooms || !bathrooms || !max_guests || !price_per_night || !address || !city || !state) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Title, bedrooms, bathrooms, max_guests, price_per_night, address, city, and state are required'
      });
    }

    // Convert amenities array to JSON string for storage
    const amenitiesJson = Array.isArray(amenities) ? JSON.stringify(amenities) : null;

    // Insert apartment into database
    const stmt = db.prepare(`
      INSERT INTO apartments (
        title, description, bedrooms, bathrooms, max_guests,
        price_per_night, address, city, state, available, featured, amenities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      description,
      bedrooms,
      bathrooms,
      max_guests,
      price_per_night,
      address,
      city,
      state,
      available ? 1 : 0,
      featured ? 1 : 0,
      amenitiesJson
    );

    // Get the newly created apartment
    const newApartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Apartment created successfully',
      apartment: {
        ...newApartment,
        available: Boolean(newApartment.available),
        featured: Boolean(newApartment.featured),
        amenities: newApartment.amenities ? JSON.parse(newApartment.amenities) : [],
        images: [],
        videos: []
      }
    });

  } catch (error) {
    console.error('Error creating apartment:', error);
    res.status(500).json({ 
      error: 'Failed to create apartment',
      message: error.message
    });
  }
}

/**
 * UPDATE APARTMENT
 * Protected - admin only
 * Like updating an item in an array
 */
function updateApartment(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if apartment exists
    const existing = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ 
        error: 'Apartment not found',
        message: `No apartment found with ID: ${id}`
      });
    }

    // Build dynamic UPDATE query based on provided fields
    const allowedFields = [
      'title', 'description', 'bedrooms', 'bathrooms', 'max_guests',
      'price_per_night', 'address', 'city', 'state', 'available', 'featured', 'amenities'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        
        // Handle special cases
        if (key === 'available' || key === 'featured') {
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'amenities') {
          values.push(Array.isArray(updates[key]) ? JSON.stringify(updates[key]) : null);
        } else {
          values.push(updates[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update',
        message: 'Provide at least one valid field to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    // Add id to values (for WHERE clause)
    values.push(id);

    // Execute update
    const stmt = db.prepare(`
      UPDATE apartments 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);

    // Get updated apartment
    const updated = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Apartment updated successfully',
      apartment: {
        ...updated,
        available: Boolean(updated.available),
        featured: Boolean(updated.featured),
        amenities: updated.amenities ? JSON.parse(updated.amenities) : []
      }
    });

  } catch (error) {
    console.error('Error updating apartment:', error);
    res.status(500).json({ 
      error: 'Failed to update apartment',
      message: error.message
    });
  }
}

/**
 * DELETE APARTMENT
 * Protected - admin only
 * Like filtering out an item from an array
 */
async function deleteApartment(req, res) {
  try {
    const { id } = req.params;

    // Check if apartment exists
    const apartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
    if (!apartment) {
      return res.status(404).json({ 
        error: 'Apartment not found',
        message: `No apartment found with ID: ${id}`
      });
    }

    // Get all images and videos to delete files from disk
    const images = db.prepare('SELECT * FROM apartment_images WHERE apartment_id = ?').all(id);
    const videos = db.prepare('SELECT * FROM apartment_videos WHERE apartment_id = ?').all(id);

    // Delete apartment (images and videos will be auto-deleted due to CASCADE)
    db.prepare('DELETE FROM apartments WHERE id = ?').run(id);

    // Delete actual files from disk
    const deletePromises = [];

    images.forEach(img => {
      const filePath = path.join(__dirname, '..', img.image_url);
      deletePromises.push(
        fs.unlink(filePath).catch(err => console.log(`Could not delete ${filePath}:`, err.message))
      );
    });

    videos.forEach(vid => {
      const filePath = path.join(__dirname, '..', vid.video_url);
      deletePromises.push(
        fs.unlink(filePath).catch(err => console.log(`Could not delete ${filePath}:`, err.message))
      );
    });

    await Promise.all(deletePromises);

    res.json({
      success: true,
      message: 'Apartment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting apartment:', error);
    res.status(500).json({ 
      error: 'Failed to delete apartment',
      message: error.message
    });
  }
}

/**
 * GET DASHBOARD STATISTICS
 * Protected - admin only
 */
function getStatistics(req, res) {
  try {
    // Total apartments
    const totalApartments = db.prepare('SELECT COUNT(*) as count FROM apartments').get().count;
    
    // Available apartments
    const availableApartments = db.prepare('SELECT COUNT(*) as count FROM apartments WHERE available = 1').get().count;
    
    // Reserved apartments
    const reservedApartments = db.prepare('SELECT COUNT(*) as count FROM apartments WHERE available = 0').get().count;
    
    // Total images
    const totalImages = db.prepare('SELECT COUNT(*) as count FROM apartment_images').get().count;
    
    // Featured apartments
    const featuredApartments = db.prepare('SELECT COUNT(*) as count FROM apartments WHERE featured = 1').get().count;

    res.json({
      success: true,
      statistics: {
        totalApartments,
        availableApartments,
        reservedApartments,
        totalImages,
        featuredApartments
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
}

module.exports = {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getStatistics
};