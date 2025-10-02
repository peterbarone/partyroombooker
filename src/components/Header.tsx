import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Party Room Booker
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              Home
            </Link>
            <Link
              href="/rooms"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              Rooms
            </Link>
            <Link
              href="/bookings"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              My Bookings
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600 transition duration-200">
              Sign In
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
