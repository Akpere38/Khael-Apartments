// src/pages/HomePage.jsx
// Main landing page showing all available apartments

import { useState, useEffect } from 'react';
import { apartmentAPI } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';

function HomePage() {
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200000,
    bedrooms: 'all'
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, apartments]);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const data = await apartmentAPI.getAll();
      
      // Sort apartments: featured first, then by date
      const sorted = (data.apartments || []).sort((a, b) => {
        // Featured apartments come first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then sort by creation date (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setApartments(sorted);
      setError(null);
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setError('Failed to load apartments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...apartments];

    // Filter by price range
    filtered = filtered.filter(apt => 
      apt.price_per_night >= filters.minPrice && 
      apt.price_per_night <= filters.maxPrice
    );

    // Filter by bedrooms
    if (filters.bedrooms !== 'all') {
      filtered = filtered.filter(apt => 
        apt.bedrooms === parseInt(filters.bedrooms)
      );
    }

    setFilteredApartments(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 200000,
      bedrooms: 'all'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Khael Apartments
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Premium Short-Let Apartments in Abuja, Nigeria
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Experience comfort and luxury in our carefully curated selection of apartments. 
            Your home away from home awaits.
          </p>
        </div>
      </section>

      {/* Apartments Section */}
      <section id="apartments" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark mb-8">
            Available Apartments
          </h2>

          {/* Search & Filter */}
          {!loading && apartments.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per night)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₦0</span>
                      <span className="font-semibold text-primary">
                        Up to ₦{filters.maxPrice.toLocaleString()}
                      </span>
                      <span>₦200,000+</span>
                    </div>
                  </div>
                </div>

                {/* Bedrooms Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                Showing <span className="font-semibold text-dark">{filteredApartments.length}</span> of <span className="font-semibold text-dark">{apartments.length}</span> apartments
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* No Apartments */}
          {!loading && !error && apartments.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No apartments available
              </h3>
              <p className="text-gray-500">
                Check back soon for new listings!
              </p>
            </div>
          )}

          {/* No Results from Filter */}
          {!loading && !error && apartments.length > 0 && filteredApartments.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No apartments match your filters
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Apartments Grid */}
          {!loading && !error && filteredApartments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} apartment={apartment} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
                alt="Luxury apartment interior"
                className="rounded-xl shadow-lg w-full h-96 object-cover"
              />
            </div>

            {/* Right - Content */}
            <div>
              <h2 className="text-3xl font-bold text-dark mb-6">
                About Khael Apartments
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Welcome to Khael Apartments, your premier destination for luxury short-let accommodations 
                in Abuja, Nigeria. We specialize in providing comfortable, fully-furnished apartments 
                that feel like home, whether you're visiting for business or pleasure.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Our carefully curated selection of apartments offers modern amenities, prime locations, 
                and exceptional service. Each property is maintained to the highest standards to ensure 
                your stay is comfortable, convenient, and memorable.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                With years of experience in hospitality and property management, we understand what 
                travelers need. That's why we go above and beyond to make your stay exceptional.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-dark">Prime Locations</h3>
                    <p className="text-sm text-gray-600">Strategic areas in Abuja</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-dark">Fully Furnished</h3>
                    <p className="text-sm text-gray-600">Everything you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-dark">24/7 Support</h3>
                    <p className="text-sm text-gray-600">We're always available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-dark">Flexible Stays</h3>
                    <p className="text-sm text-gray-600">Daily, weekly, monthly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600">
              Have questions or ready to book? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-dark mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">
                Chat with us directly for quick responses
              </p>
              <a
                href="https://wa.me/2348148510983?text=Hi,%20I'd%20like%20to%20inquire%20about%20your%20apartments"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Start Chat
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-dark mb-2">Email</h3>
              <p className="text-gray-600 mb-4">
                Send us an email and we'll respond promptly
              </p>
              <a
                href="mailto:info@khaelapartments.com"
                className="inline-flex items-center gap-2 text-primary hover:text-red-600 font-semibold"
              >
                info@khaelapartments.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-dark mb-2">Location</h3>
              <p className="text-gray-600">
                Abuja, FCT, Nigeria
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">🕐</div>
              <h3 className="text-xl font-semibold text-dark mb-2">Availability</h3>
              <p className="text-gray-600">
                24/7 Customer Support<br />
                Always here to help you
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-dark mb-4">
              Ready to Book Your Stay?
            </h3>
            <p className="text-gray-600 mb-6">
              Browse our available apartments and find your perfect home away from home
            </p>
            <a
              href="#apartments"
              className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition font-semibold"
            >
              View Apartments
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;