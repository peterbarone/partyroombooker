import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-party-gradient shadow-xl relative overflow-hidden">
      {/* Fun background patterns */}
      <div className="absolute inset-0 bg-party-pattern opacity-10"></div>

      {/* Floating decorative elements */}
      <div className="absolute top-2 left-10 w-3 h-3 bg-party-yellow rounded-full animate-float opacity-70"></div>
      <div
        className="absolute top-4 right-20 w-2 h-2 bg-white rounded-full animate-float opacity-70"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-2 left-1/4 w-4 h-4 bg-party-green rounded-full animate-float opacity-70"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="text-3xl font-party font-bold text-white hover:text-party-yellow transition-all duration-300 transform hover:scale-105 drop-shadow-lg"
          >
            � Family Fun Factory �
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className="text-white hover:text-party-yellow transition-all duration-300 font-playful font-semibold text-lg transform hover:scale-110 hover:rotate-1 drop-shadow"
            >
              🏠 Home
            </Link>
            <Link
              href="/rooms"
              className="text-white hover:text-party-yellow transition-all duration-300 font-playful font-semibold text-lg transform hover:scale-110 hover:rotate-1 drop-shadow"
            >
              🏰 Party Rooms
            </Link>
            <Link
              href="/bookings"
              className="text-white hover:text-party-yellow transition-all duration-300 font-playful font-semibold text-lg transform hover:scale-110 hover:rotate-1 drop-shadow"
            >
              🎂 My Parties
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-yellow-200 transition-all duration-300 font-playful font-semibold text-lg transform hover:scale-110 hover:rotate-1 drop-shadow"
            >
              ⭐ About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-yellow-200 transition-all duration-300 font-playful font-semibold text-lg transform hover:scale-110 hover:rotate-1 drop-shadow"
            >
              📞 Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="text-white hover:text-yellow-200 transition-all duration-300 font-playful font-semibold transform hover:scale-110 hover:rotate-2 drop-shadow">
              👤 Sign In
            </button>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-yellow-300 px-6 py-2 rounded-full transition-all duration-300 font-party font-bold transform hover:scale-110 hover:-rotate-1 shadow-lg hover:shadow-xl">
              🚀 Join the Fun!
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white hover:text-yellow-200 transition-all duration-300 transform hover:scale-110">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300"></div>
    </header>
  );
}
