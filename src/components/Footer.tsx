export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Party Room Booker</h3>
            <p className="text-gray-400">
              Find and book the perfect venue for your special events and
              celebrations.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="/rooms"
                  className="hover:text-white transition duration-200"
                >
                  Browse Rooms
                </a>
              </li>
              <li>
                <a
                  href="/bookings"
                  className="hover:text-white transition duration-200"
                >
                  My Bookings
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-white transition duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="/help"
                  className="hover:text-white transition duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:text-white transition duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-white transition duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white transition duration-200"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>📧 info@partyroombooker.com</p>
              <p>📞 (555) 123-4567</p>
              <p>📍 123 Event Street, Party City, PC 12345</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Party Room Booker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
