// src/utils/formatters.js
// Helper functions for formatting data
// Like custom hooks or utility functions in React

/**
 * Format price in Nigerian Naira
 * @param {number} amount - Price amount
 * @returns {string} Formatted price (e.g., "₦45,000")
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15, 2026")
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with "..." if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get full image URL
 * @param {string} imageUrl - Image URL (Cloudinary or local)
 * @returns {string} Full URL
 */
export const getImageUrl = (imageUrl) => {
  // If it's already a full URL (Cloudinary), return as-is
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  
  // For local images (backward compatibility)
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${imageUrl}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get guest text (singular/plural)
 * @param {number} count - Number of guests
 * @returns {string} "1 guest" or "2 guests"
 */
export const getGuestText = (count) => {
  return `${count} ${count === 1 ? 'guest' : 'guests'}`;
};

/**
 * Get bedroom text (singular/plural)
 * @param {number} count - Number of bedrooms
 * @returns {string} "1 bedroom" or "2 bedrooms"
 */
export const getBedroomText = (count) => {
  return `${count} ${count === 1 ? 'bedroom' : 'bedrooms'}`;
};

/**
 * Get bathroom text (singular/plural)
 * @param {number} count - Number of bathrooms
 * @returns {string} "1 bathroom" or "2 bathrooms"
 */
export const getBathroomText = (count) => {
  return `${count} ${count === 1 ? 'bathroom' : 'bathrooms'}`;
};