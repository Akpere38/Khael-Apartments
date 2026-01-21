// src/pages/ApartmentDetails.jsx
// Detailed view of a single apartment

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apartmentAPI } from '../services/api';
import ImageCarousel from '../components/ImageCarousel';
import { formatPrice, getImageUrl } from '../utils/formatters';

function ApartmentDetails() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApartment();
  }, [id]);

  const fetchApartment = async () => {
    try {
      setLoading(true);
      const data = await apartmentAPI.getById(id);
      setApartment(data.apartment);
      setError(null);
    } catch (err) {
      console.error('Error fetching apartment:', err);
      setError('Failed to load apartment details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Apartment Not Found
        </h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-primary hover:text-red-600 mb-6 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Apartments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            <ImageCarousel images={apartment.images} />

            {/* Video (if available) */}
            {apartment.videos && apartment.videos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Video Tour</h3>
                <video
                  controls
                  className="w-full rounded-xl"
                  src={getImageUrl(apartment.videos[0].video_url)}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Title and Location */}
            <h1 className="text-3xl font-bold text-dark mb-2">
              {apartment.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              📍 {apartment.address}, {apartment.city}, {apartment.state}
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b">
              <div className="text-center">
                <div className="text-2xl mb-1">🛏️</div>
                <div className="text-sm text-gray-600">
                  {apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🚿</div>
                <div className="text-sm text-gray-600">
                  {apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm text-gray-600">
                  Up to {apartment.max_guests} Guests
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(apartment.price_per_night)}
                </span>
                <span className="text-xl text-gray-600 ml-2">per night</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">About this apartment</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {apartment.description || 'No description available.'}
              </p>
            </div>

            {/* Amenities */}
            {apartment.amenities && apartment.amenities.length > 0 && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-2xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {apartment.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-lg font-semibold mr-3">Status:</span>
                {apartment.available ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                    Available
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold">
                    Reserved
                  </span>
                )}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">
                Interested in this apartment?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact us for bookings and inquiries.
              </p>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/2348148510983?text=Hi!%20I'm%20interested%20in%20this%20apartment:%0A%0A*${encodeURIComponent(apartment.title)}*%0A%0A📍%20Address:%20${encodeURIComponent(apartment.address)},%20${encodeURIComponent(apartment.city)}%0A💰%20Price:%20${encodeURIComponent(formatPrice(apartment.price_per_night))}/night%0A🛏️%20${apartment.bedrooms}%20Bedroom(s),%20${apartment.bathrooms}%20Bathroom(s)%0A👥%20Max%20${apartment.max_guests}%20guests%0A%0A🔗%20View%20details:%20${encodeURIComponent(window.location.href)}%0A%0AIs%20it%20available%20for%20my%20dates?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp Us
                </a>
                <a
                  href="mailto:info@khaelapartments.com"
                  className="block w-full text-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-semibold"
                >
                  Email Us
                </a>
              </div>

              {/* Social Share */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Share this apartment:</h4>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=Check%20out%20this%20apartment:%20${encodeURIComponent(apartment.title)}%20-%20${encodeURIComponent(formatPrice(apartment.price_per_night))}/night%0A${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    title="Share on Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this apartment: ${apartment.title} - ${formatPrice(apartment.price_per_night)}/night`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm"
                    title="Share on X (Twitter)"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApartmentDetails;