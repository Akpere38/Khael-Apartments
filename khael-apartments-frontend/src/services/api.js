// src/services/api.js
// This is your centralized API service
// Think of it as a custom hook that handles all backend communication

import axios from 'axios';

// Base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically if it exists
// This is like a middleware that runs before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid/expired, clear it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTHENTICATION ENDPOINTS
// ===========================

export const authAPI = {
  // Login
  login: async (username, password) => {
    const response = await api.post('/admin/login', { username, password });
    return response.data;
  },

  // Verify token is still valid
  verifyToken: async () => {
    const response = await api.get('/admin/verify');
    return response.data;
  },

  // Logout (just clear local storage)
  logout: () => {
    localStorage.removeItem('adminToken');
  },
};

// ===========================
// APARTMENT ENDPOINTS
// ===========================

export const apartmentAPI = {
  // Get all apartments (public)
  getAll: async () => {
    const response = await api.get('/apartments');
    return response.data;
  },

  // Get single apartment by ID (public)
  getById: async (id) => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  },

  // Create new apartment (admin only)
  create: async (apartmentData) => {
    const response = await api.post('/apartments', apartmentData);
    return response.data;
  },

  // Update apartment (admin only)
  update: async (id, apartmentData) => {
    const response = await api.put(`/apartments/${id}`, apartmentData);
    return response.data;
  },

  // Delete apartment (admin only)
  delete: async (id) => {
    const response = await api.delete(`/apartments/${id}`);
    return response.data;
  },

  // Upload images (admin only)
  uploadImages: async (apartmentId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post(`/apartments/${apartmentId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload video (admin only)
  uploadVideo: async (apartmentId, file) => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await api.post(`/apartments/${apartmentId}/videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete image (admin only)
  deleteImage: async (apartmentId, imageId) => {
    const response = await api.delete(`/apartments/${apartmentId}/images/${imageId}`);
    return response.data;
  },

  // Set primary image (admin only)
  setPrimaryImage: async (apartmentId, imageId) => {
    const response = await api.put(`/apartments/${apartmentId}/images/${imageId}/primary`);
    return response.data;
  },

  // Get statistics (admin only)
  getStatistics: async () => {
    const response = await api.get('/apartments/statistics');
    return response.data;
  },
};

// Export the axios instance for custom requests if needed
export default api;