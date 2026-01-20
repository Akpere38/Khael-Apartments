// src/routes/apartments.js
// Apartment routes with Cloudinary cloud storage

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/auth');
const {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getStatistics
} = require('../controllers/apartmentController');

// ===========================
// CLOUDINARY CONFIGURATION
// ===========================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===========================
// FILE UPLOAD CONFIGURATION (CLOUDINARY)
// ===========================

// Configure Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khael-apartments/images', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit' }] // Auto-resize large images
  }
});

// Configure Cloudinary storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khael-apartments/videos',
    allowed_formats: ['mp4', 'webm', 'ogg'],
    resource_type: 'video'
  }
});

// File filter - only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP images and MP4, WEBM, OGG videos are allowed.'), false);
  }
};

// Create multer upload instances
const imageUpload = multer({
  storage: imageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max for images
  }
});

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max for videos
  }
});

// ===========================
// PUBLIC ROUTES (No authentication required)
// ===========================

/**
 * GET /api/apartments
 * Get all available apartments
 */
router.get('/', getAllApartments);

/**
 * GET /api/apartments/:id
 * Get single apartment by ID
 */
router.get('/:id', getApartmentById);

// ===========================
// PROTECTED ROUTES (Admin only)
// ===========================

/**
 * GET /api/apartments/statistics
 * Get dashboard statistics
 */
router.get('/statistics', authenticateAdmin, getStatistics);

/**
 * POST /api/apartments
 * Create new apartment
 */
router.post('/', authenticateAdmin, createApartment);

/**
 * PUT /api/apartments/:id
 * Update existing apartment
 */
router.put('/:id', authenticateAdmin, updateApartment);

/**
 * DELETE /api/apartments/:id
 * Delete apartment
 */
router.delete('/:id', authenticateAdmin, deleteApartment);

// ===========================
// FILE UPLOAD ROUTES (CLOUDINARY)
// ===========================

/**
 * POST /api/apartments/:id/images
 * Upload images to Cloudinary
 */
router.post('/:id/images', authenticateAdmin, imageUpload.array('images', 10), async (req, res) => {
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

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No files uploaded',
        message: 'Please select at least one image to upload'
      });
    }

    // Get current max display_order
    const maxOrder = db.prepare(`
      SELECT MAX(display_order) as max_order 
      FROM apartment_images 
      WHERE apartment_id = ?
    `).get(id);

    let currentOrder = (maxOrder?.max_order || -1) + 1;

    // Insert image records into database with Cloudinary URLs
    const stmt = db.prepare(`
      INSERT INTO apartment_images (apartment_id, image_url, display_order)
      VALUES (?, ?, ?)
    `);

    const uploadedImages = req.files.map((file, index) => {
      // Cloudinary returns the URL in file.path
      const imageUrl = file.path;
      stmt.run(id, imageUrl, currentOrder + index);
      return {
        url: imageUrl,
        filename: file.filename,
        size: file.size
      };
    });

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully to Cloudinary`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      message: error.message
    });
  }
});

/**
 * POST /api/apartments/:id/videos
 * Upload video to Cloudinary
 */
router.post('/:id/videos', authenticateAdmin, videoUpload.single('video'), async (req, res) => {
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a video to upload'
      });
    }

    const videoUrl = req.file.path; // Cloudinary URL

    // Insert video record into database
    const stmt = db.prepare(`
      INSERT INTO apartment_videos (apartment_id, video_url)
      VALUES (?, ?)
    `);

    stmt.run(id, videoUrl);

    res.json({
      success: true,
      message: 'Video uploaded successfully to Cloudinary',
      video: {
        url: videoUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      message: error.message
    });
  }
});

/**
 * DELETE /api/apartments/:apartmentId/images/:imageId
 * Delete image from Cloudinary and database
 */
router.delete('/:apartmentId/images/:imageId', authenticateAdmin, async (req, res) => {
  try {
    const { apartmentId, imageId } = req.params;

    // Get image record
    const image = db.prepare(`
      SELECT * FROM apartment_images 
      WHERE id = ? AND apartment_id = ?
    `).get(imageId, apartmentId);

    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found',
        message: 'Image does not exist or does not belong to this apartment'
      });
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = image.image_url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${filename}`;

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.log('Could not delete from Cloudinary:', cloudinaryError.message);
      // Continue anyway - at least delete from database
    }

    // Delete from database
    db.prepare('DELETE FROM apartment_images WHERE id = ?').run(imageId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message
    });
  }
});

/**
 * PUT /api/apartments/:apartmentId/images/:imageId/primary
 * Set an image as the primary image
 */
router.put('/:apartmentId/images/:imageId/primary', authenticateAdmin, (req, res) => {
  try {
    const { apartmentId, imageId } = req.params;

    // Check if image exists
    const image = db.prepare(`
      SELECT * FROM apartment_images 
      WHERE id = ? AND apartment_id = ?
    `).get(imageId, apartmentId);

    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found',
        message: 'Image does not exist or does not belong to this apartment'
      });
    }

    // Remove primary flag from all images of this apartment
    db.prepare(`
      UPDATE apartment_images 
      SET is_primary = 0 
      WHERE apartment_id = ?
    `).run(apartmentId);

    // Set this image as primary
    db.prepare(`
      UPDATE apartment_images 
      SET is_primary = 1 
      WHERE id = ?
    `).run(imageId);

    res.json({
      success: true,
      message: 'Primary image updated successfully'
    });

  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ 
      error: 'Failed to set primary image',
      message: error.message
    });
  }
});

module.exports = router;