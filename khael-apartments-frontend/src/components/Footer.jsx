// src/components/Footer.jsx
// Footer component

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Khael Apartments</h3>
            <p className="text-gray-300 text-sm">
              Premium short-let apartments in Abuja, Nigeria. 
              Your home away from home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#apartments" className="text-gray-300 hover:text-white transition">
                  Apartments
                </a>
              </li>
              <li>
                <a href="/#about" className="text-gray-300 hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-gray-300 hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📍 Abuja, FCT, Nigeria</li>
              <li>📧 info@khaelapartments.com</li>
              <li>📱 +234 814 851 0983</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} Khael Apartments. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;