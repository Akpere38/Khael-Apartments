// src/pages/AdminDashboard.jsx
// Admin dashboard for managing apartments

import { useState, useEffect } from 'react';
import { apartmentAPI } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/formatters';

function AdminDashboard() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Available amenities
  const availableAmenities = [
    'WiFi',
    'Air Conditioning',
    '24/7 Electricity',
    'Kitchen',
    'Parking',
    'TV',
    'Netflix',
    'PS5',
    'Washer/Dryer',
    'Swimming Pool',
    'Gym',
    'Security',
    'Generator',
    'Hot Water',
    'Balcony'
  ];

  // Form state for creating/editing apartment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    price_per_night: 0,
    address: '',
    city: 'Abuja',
    state: 'FCT',
    available: true,
    featured: false,
    amenities: []
  });

  useEffect(() => {
    fetchApartments();
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await apartmentAPI.getStatistics();
      setStatistics(data.statistics);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const data = await apartmentAPI.getAll();
      // Show all apartments (including unavailable ones) in admin view
      setApartments(data.apartments || []);
    } catch (err) {
      console.error('Error fetching apartments:', err);
      alert('Failed to load apartments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const openCreateModal = () => {
    setEditingApartment(null);
    setFormData({
      title: '',
      description: '',
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 2,
      price_per_night: 0,
      address: '',
      city: 'Abuja',
      state: 'FCT',
      available: true,
      featured: false,
      amenities: []
    });
    setShowModal(true);
  };

  const openEditModal = (apartment) => {
    setEditingApartment(apartment);
    setFormData({
      title: apartment.title,
      description: apartment.description || '',
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      max_guests: apartment.max_guests,
      price_per_night: apartment.price_per_night,
      address: apartment.address,
      city: apartment.city,
      state: apartment.state,
      available: apartment.available,
      featured: apartment.featured || false,
      amenities: apartment.amenities || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingApartment) {
        // Update existing apartment
        await apartmentAPI.update(editingApartment.id, formData);
        alert('Apartment updated successfully!');
      } else {
        // Create new apartment
        await apartmentAPI.create(formData);
        alert('Apartment created successfully!');
      }

      setShowModal(false);
      fetchApartments();
      fetchStatistics();
    } catch (err) {
      console.error('Error saving apartment:', err);
      alert(err.response?.data?.message || 'Failed to save apartment');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await apartmentAPI.delete(id);
      alert('Apartment deleted successfully!');
      fetchApartments();
      fetchStatistics();
    } catch (err) {
      console.error('Error deleting apartment:', err);
      alert('Failed to delete apartment');
    }
  };

  const toggleAvailability = async (apartment) => {
    try {
      await apartmentAPI.update(apartment.id, {
        available: !apartment.available,
      });
      fetchApartments();
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability');
    }
  };

  const handleImageUpload = async (apartmentId, files) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      await apartmentAPI.uploadImages(apartmentId, Array.from(files));
      alert('Images uploaded successfully!');
      fetchApartments();
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (apartmentId, imageId) => {
    if (!confirm('Delete this image?')) return;

    try {
      await apartmentAPI.deleteImage(apartmentId, imageId);
      fetchApartments();
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Failed to delete image');
    }
  };

  const handleSetPrimaryImage = async (apartmentId, imageId) => {
    try {
      await apartmentAPI.setPrimaryImage(apartmentId, imageId);
      fetchApartments();
    } catch (err) {
      console.error('Error setting primary image:', err);
      alert('Failed to set primary image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage your apartments ({apartments.length} total)
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Apartment
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">🏠</div>
              <div className="text-2xl font-bold text-dark">{statistics.totalApartments}</div>
              <div className="text-sm text-gray-600">Total Apartments</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{statistics.availableApartments}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-yellow-600">{statistics.reservedApartments}</div>
              <div className="text-sm text-gray-600">Reserved</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.featuredApartments}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">📸</div>
              <div className="text-2xl font-bold text-purple-600">{statistics.totalImages}</div>
              <div className="text-sm text-gray-600">Total Images</div>
            </div>
          </div>
        )}

        {/* Apartments List */}
        {apartments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No apartments yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first apartment to get started
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition"
            >
              Add Your First Apartment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {apartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                onEdit={() => openEditModal(apartment)}
                onDelete={() => handleDelete(apartment.id, apartment.title)}
                onToggleAvailability={() => toggleAvailability(apartment)}
                onImageUpload={(files) => handleImageUpload(apartment.id, files)}
                onDeleteImage={(imageId) => handleDeleteImage(apartment.id, imageId)}
                onSetPrimaryImage={(imageId) => handleSetPrimaryImage(apartment.id, imageId)}
                uploadingImages={uploadingImages}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <ApartmentModal
            apartment={editingApartment}
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
            availableAmenities={availableAmenities}
            onAmenityToggle={handleAmenityToggle}
          />
        )}
      </div>
    </div>
  );
}

// Apartment Card Component (for admin view)
function ApartmentCard({ 
  apartment, 
  onEdit, 
  onDelete, 
  onToggleAvailability,
  onImageUpload,
  onDeleteImage,
  onSetPrimaryImage,
  uploadingImages
}) {
  const [showImages, setShowImages] = useState(false);
  const primaryImage = apartment.images?.find(img => img.is_primary) || apartment.images?.[0];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-dark">{apartment.title}</h3>
              {apartment.featured && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                  ⭐ FEATURED
                </span>
              )}
            </div>
            <p className="text-gray-600">
              📍 {apartment.address}, {apartment.city}, {apartment.state}
            </p>
          </div>
          {primaryImage && (
            <img
              src={getImageUrl(primaryImage.image_url)}
              alt={apartment.title}
              className="w-24 h-24 object-cover rounded-lg ml-4"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
              }}
            />
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">Bedrooms</span>
            <p className="font-semibold">{apartment.bedrooms}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Bathrooms</span>
            <p className="font-semibold">{apartment.bathrooms}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Max Guests</span>
            <p className="font-semibold">{apartment.max_guests}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Price/Night</span>
            <p className="font-semibold text-primary">{formatPrice(apartment.price_per_night)}</p>
          </div>
        </div>

        {/* Amenities */}
        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-2">Amenities:</span>
            <div className="flex flex-wrap gap-2">
              {apartment.amenities.map((amenity, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Edit Details
          </button>
          <button
            onClick={onToggleAvailability}
            className={`px-4 py-2 rounded-lg transition ${
              apartment.available
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {apartment.available ? 'Mark as Reserved' : 'Mark as Available'}
          </button>
          <button
            onClick={() => setShowImages(!showImages)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            {showImages ? 'Hide' : 'Manage'} Images ({apartment.images?.length || 0})
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>

        {/* Availability Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {apartment.available ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Available
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              Reserved
            </span>
          )}
        </div>

        {/* Image Management Section */}
        {showImages && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">Manage Images</h4>
            
            {/* Upload Images */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onImageUpload(e.target.files)}
                disabled={uploadingImages}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-red-600 disabled:opacity-50"
              />
            </div>

            {/* Existing Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {apartment.images?.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={getImageUrl(image.image_url)}
                    alt="Apartment"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x150?text=Error';
                    }}
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!image.is_primary && (
                      <button
                        onClick={() => onSetPrimaryImage(image.id)}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteImage(image.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create/Edit Modal Component
function ApartmentModal({ apartment, formData, onChange, onSubmit, onClose, availableAmenities, onAmenityToggle }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {apartment ? 'Edit Apartment' : 'Create New Apartment'}
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., Luxury 2-Bedroom Apartment"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Describe the apartment..."
              />
            </div>

            {/* Grid for numbers */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={onChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={onChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Guests *
                </label>
                <input
                  type="number"
                  name="max_guests"
                  value={formData.max_guests}
                  onChange={onChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Night (₦) *
              </label>
              <input
                type="number"
                name="price_per_night"
                value={formData.price_per_night}
                onChange={onChange}
                min="0"
                step="1000"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., 35000"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., 123 Cadastral Zone, Maitama"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => onAmenityToggle(amenity)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={formData.available}
                  onChange={onChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                  Available for booking
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={onChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  ⭐ Mark as Featured (shows first on homepage)
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition font-semibold"
              >
                {apartment ? 'Update Apartment' : 'Create Apartment'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;