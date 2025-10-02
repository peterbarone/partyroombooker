import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-purple-800 via-pink-700 to-blue-800 text-white relative overflow-hidden">
      {/* Fun background elements */}
      <div className="absolute inset-0 bg-party-pattern opacity-5"></div>
      <div className="absolute top-4 left-10 w-6 h-6 bg-yellow-300 rounded-full animate-float opacity-30"></div>
      <div
        className="absolute top-8 right-20 w-4 h-4 bg-pink-300 rounded-full animate-float opacity-30"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-10 left-1/4 w-5 h-5 bg-green-300 rounded-full animate-float opacity-30"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-party font-bold mb-4 text-yellow-200">
              🎉 Party Room Booker 🎊
            </h3>
            <p className="text-purple-200 font-playful leading-relaxed">
              Where magical memories are made! Find and book the perfect venue
              for your special celebrations and create unforgettable moments! ✨
            </p>
            <div className="mt-4 flex justify-center md:justify-start space-x-3">
              <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white animate-bounce-fun">
                🎈
              </div>
              <div
                className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white animate-bounce-fun"
                style={{ animationDelay: "0.5s" }}
              >
                🎪
              </div>
              <div
                className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white animate-bounce-fun"
                style={{ animationDelay: "1s" }}
              >
                🎯
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-party font-bold mb-4 text-yellow-200 flex items-center">
              🚀 Quick Links
            </h4>
            <ul className="space-y-3 text-purple-200 font-playful">
              <li>
                <Link
                  href="/rooms"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  🏰 Browse Amazing Rooms
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  📅 My Party Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  ⭐ About Our Magic
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  📞 Get in Touch
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-lg font-party font-bold mb-4 text-yellow-200 flex items-center">
              🎪 Party Support
            </h4>
            <ul className="space-y-3 text-purple-200 font-playful">
              <li>
                <Link
                  href="/help"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  🆘 Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  ❓ Fun FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  📋 Party Rules
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 hover:translate-x-1 inline-block"
                >
                  🔒 Privacy Promise
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-party font-bold mb-4 text-yellow-200 flex items-center">
              💬 Let&apos;s Party Together!
            </h4>
            <div className="space-y-3 text-purple-200 font-playful">
              <div className="flex items-center space-x-2 hover:text-yellow-200 transition-all duration-300 transform hover:scale-105">
                <span className="text-xl">📧</span>
                <span>fun@partyroombooker.com</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-yellow-200 transition-all duration-300 transform hover:scale-105">
                <span className="text-xl">📞</span>
                <span>(555) PARTY-FUN</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-yellow-200 transition-all duration-300 transform hover:scale-105">
                <span className="text-xl">📍</span>
                <span>123 Celebration Street, Fun City, FC 12345</span>
              </div>
              <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-yellow-300/30">
                <p className="text-yellow-200 font-party text-center">
                  🌟 Available 24/7 for Party Emergencies! 🌟
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Divider */}
        <div className="border-t-4 border-yellow-300 mt-8 pt-8 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-300 rotate-45"></div>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-purple-200 mt-8">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="text-2xl animate-pulse">🎊</div>
            <p className="font-party text-lg">
              Making Dreams Come True Since 2025!
            </p>
            <div className="text-2xl animate-pulse">🎉</div>
          </div>
          <p className="font-playful text-sm">
            &copy; 2025 Party Room Booker. All rights reserved.
            <span className="text-yellow-200">
              {" "}
              Made with 💖 for amazing celebrations!
            </span>
          </p>

          {/* Fun social media icons */}
          <div className="flex justify-center space-x-4 mt-4">
            <button className="w-10 h-10 bg-pink-500 hover:bg-pink-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              📘
            </button>
            <button className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              🐦
            </button>
            <button className="w-10 h-10 bg-purple-500 hover:bg-purple-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              📷
            </button>
            <button className="w-10 h-10 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              📱
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
