// src/components/ApartmentCard.jsx
// Reusable apartment card component for displaying apartment previews

import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/formatters';

function ApartmentCard({ apartment }) {
  // Get primary image or first image
  const primaryImage = apartment.images?.find(img => img.is_primary) || apartment.images?.[0];
  const imageUrl = primaryImage ? getImageUrl(primaryImage.image_url) : '/placeholder.jpg';

  return (
    <Link 
      to={`/apartments/${apartment.id}`}
      className="block group"
    >
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={apartment.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          
          {/* Badges */}
          {apartment.featured && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              ⭐ Featured
            </div>
          )}
          
          {!apartment.available && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Reserved
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-xl font-semibold text-dark mb-2 line-clamp-1">
            {apartment.title}
          </h3>

          {/* Location */}
          <p className="text-gray-600 text-sm mb-3">
            📍 {apartment.city}, {apartment.state}
          </p>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>🛏️ {apartment.bedrooms} BR</span>
            <span>🚿 {apartment.bathrooms} BA</span>
            <span>👥 {apartment.max_guests} Guests</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(apartment.price_per_night)}
              </span>
              <span className="text-gray-600 text-sm"> / night</span>
            </div>
            
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ApartmentCard;