import Link from "next/link";

interface TenantHomeProps {
  params: Promise<{ tenant: string }>;
}

// Confetti component for fun background
const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className={`confetti-piece animate-pulse ${
          i % 4 === 0
            ? "bg-pink-400"
            : i % 4 === 1
            ? "bg-yellow-400"
            : i % 4 === 2
            ? "bg-blue-400"
            : "bg-green-400"
        }`}
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);

// Floating balloons component
const FloatingBalloons = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="balloon bg-pink-400 absolute top-20 left-10 animate-float"
      style={{ animationDelay: "0s" }}
    />
    <div
      className="balloon bg-blue-400 absolute top-32 right-20 animate-float"
      style={{ animationDelay: "1s" }}
    />
    <div
      className="balloon bg-yellow-400 absolute top-40 left-1/4 animate-float"
      style={{ animationDelay: "2s" }}
    />
    <div
      className="balloon bg-green-400 absolute top-16 right-1/4 animate-float"
      style={{ animationDelay: "0.5s" }}
    />
  </div>
);

export default async function TenantHome({ params }: TenantHomeProps) {
  const { tenant } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden">
      <Confetti />
      <FloatingBalloons />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-party font-bold text-rainbow mb-4 animate-bounce-fun">
              🎉 Welcome to {tenant.charAt(0).toUpperCase() + tenant.slice(1)}{" "}
              🎉
            </h1>
            <p className="text-2xl font-playful text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Where every celebration becomes a magical memory! ✨
              <br />
              <span className="text-lg text-gray-600">
                Book your perfect party space with instant confirmation
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href={`/${tenant}/book`}
              className="btn-party text-xl font-party animate-pulse-party transform hover:rotate-1 transition-all duration-300"
            >
              🚀 Book Your Epic Party Now! 🚀
            </Link>
            <Link
              href={`/${tenant}/rooms`}
              className="btn-fun text-lg font-playful transform hover:-rotate-1 transition-all duration-300"
            >
              🏠 Explore Our Rooms
            </Link>
          </div>

          {/* Fun Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-4 border-pink-200 transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-pink-600">500+</div>
              <div className="text-sm font-playful text-gray-600">
                Happy Parties! 🎊
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-4 border-blue-200 transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600">99%</div>
              <div className="text-sm font-playful text-gray-600">
                Smiles Guaranteed! 😊
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-4 border-green-200 transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm font-playful text-gray-600">
                Fun Support! 🎈
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-party text-center text-purple-700 mb-12 animate-wiggle">
            🌟 How It Works 🌟
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card-party group">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-fun">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-2xl font-party text-gray-900 mb-4">
                  1. Pick Your Perfect Date!
                </h3>
                <p className="text-gray-600 font-playful text-lg leading-relaxed">
                  Choose when you want to party and we&apos;ll show you
                  what&apos;s available! 🗓️
                </p>
              </div>
            </div>

            <div className="card-fun group">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-fun">
                  <span className="text-3xl">🏰</span>
                </div>
                <h3 className="text-2xl font-party text-gray-900 mb-4">
                  2. Choose Your Fun Zone!
                </h3>
                <p className="text-gray-600 font-playful text-lg leading-relaxed">
                  Pick from our amazing party packages and magical rooms! 🎪
                </p>
              </div>
            </div>

            <div className="card-party group">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-fun">
                  <span className="text-3xl">💳</span>
                </div>
                <h3 className="text-2xl font-party text-gray-900 mb-4">
                  3. Secure Your Spot!
                </h3>
                <p className="text-gray-600 font-playful text-lg leading-relaxed">
                  Just a small deposit and you&apos;re all set for the big day!
                  🎯
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-rainbow-300 p-8 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-party-pattern opacity-5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-party text-center text-purple-700 mb-12">
              🌈 Why Families Love Us! 🌈
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center group">
                <div className="text-6xl mb-4 group-hover:animate-wiggle transition-all duration-300">
                  🎉
                </div>
                <h4 className="text-xl font-party text-gray-900 mb-2">
                  Epic Fun Guarantee!
                </h4>
                <p className="text-gray-600 font-playful">
                  Every party is designed to create magical moments and endless
                  laughter!
                </p>
              </div>

              <div className="text-center group">
                <div className="text-6xl mb-4 group-hover:animate-wiggle transition-all duration-300">
                  ⚡
                </div>
                <h4 className="text-xl font-party text-gray-900 mb-2">
                  Lightning Fast Booking!
                </h4>
                <p className="text-gray-600 font-playful">
                  Book your dream party online in just 3 easy steps - it&apos;s
                  that simple!
                </p>
              </div>

              <div className="text-center group">
                <div className="text-6xl mb-4 group-hover:animate-wiggle transition-all duration-300">
                  💎
                </div>
                <h4 className="text-xl font-party text-gray-900 mb-2">
                  Flexible & Fair!
                </h4>
                <p className="text-gray-600 font-playful">
                  Small deposit now, pay the rest later. No hidden fees, just
                  pure fun!
                </p>
              </div>

              <div className="text-center group">
                <div className="text-6xl mb-4 group-hover:animate-wiggle transition-all duration-300">
                  �
                </div>
                <h4 className="text-xl font-party text-gray-900 mb-2">
                  Full Party Service!
                </h4>
                <p className="text-gray-600 font-playful">
                  Sit back and relax - we handle decorations, setup, and
                  cleanup!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-confetti opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-party mb-6 animate-pulse-party">
              🎊 Ready to Party? 🎊
            </h2>
            <p className="text-xl font-playful mb-8 max-w-2xl mx-auto">
              Join hundreds of families who&apos;ve made unforgettable memories
              with us! Your perfect party is just one click away! ✨
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${tenant}/book`}
                className="bg-white text-purple-600 hover:text-purple-800 font-bold py-4 px-8 rounded-full text-xl font-party transform hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                🚀 Start Your Party Adventure! 🚀
              </Link>

              <button className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 font-bold py-4 px-8 rounded-full text-xl font-party transform hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl">
                📞 Call Us: (555) PARTY-FUN
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial Preview */}
        <div className="mt-16 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border-4 border-yellow-200">
            <div className="text-5xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-lg font-playful text-gray-700 italic mb-4">
              &quot;Best party ever! The kids had a blast and I didn&apos;t have
              to worry about anything. The staff was amazing and the room was
              perfect!&quot;
            </p>
            <p className="font-party text-purple-600">
              - Sarah M., Happy Mom 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
