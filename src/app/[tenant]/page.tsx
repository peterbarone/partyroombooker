import Link from "next/link";
import ResponsiveBackground from "@/components/ResponsiveBackground";

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
    <div className="min-h-screen relative overflow-hidden">
      <ResponsiveBackground className="absolute inset-0 -z-10" overlay={<div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-pink-500/40 to-pink-600/30"/>} />
      <Confetti />
      <FloatingBalloons />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 animate-bounce-fun text-shadow-strong tracking-tight">
              🎉 WELCOME TO {tenant.charAt(0).toUpperCase() + tenant.slice(1).toUpperCase()}{" "}
              🎉
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-white max-w-4xl mx-auto mb-8 leading-relaxed text-shadow-soft">
              WHERE EVERY CELEBRATION BECOMES A MAGICAL MEMORY! ✨
              <br />
              <span className="text-xl md:text-2xl text-yellow-200 font-bold">
                BOOK YOUR PERFECT PARTY SPACE WITH INSTANT CONFIRMATION
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              href={`/${tenant}/book`}
              className="bg-white text-pink-600 text-xl md:text-2xl font-black px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-white hover:border-yellow-400"
            >
              🚀 BOOK YOUR EPIC PARTY NOW! 🚀
            </Link>
            <Link
              href={`/${tenant}/rooms`}
              className="bg-yellow-400 text-pink-600 text-lg md:text-xl font-black px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-yellow-400 hover:border-white"
            >
              🏠 EXPLORE OUR ROOMS
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

        {/* How It Works Section (Restyled) */}
        <section className="mb-20 relative">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-5xl md:text-6xl font-black tracking-tight mb-12">
              <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                How It Works
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📅',
                  title: 'Pick Your Perfect Date',
                  text: "Choose when you want to party and we'll show what's available!",
                  gradient: 'from-pink-500 to-pink-600'
                },
                {
                  icon: '🏰',
                  title: 'Choose Your Fun Zone',
                  text: 'Pick from our amazing party packages and magical rooms!',
                  gradient: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: '💳',
                  title: 'Secure Your Spot',
                  text: "Small deposit and you are all set for the big day!",
                  gradient: 'from-blue-400 to-green-500'
                }
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-lg bg-gradient-to-br ${step.gradient} group-hover:scale-105 transition-transform`}>{step.icon}</div>
                  <h3 className="text-2xl font-black text-brown-dark mb-4 leading-snug">
                    {i + 1}. {step.title}!
                  </h3>
                  <p className="font-playful text-brown-700 leading-relaxed text-lg">
                    {step.text}
                  </p>
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-yellow-400/10 rounded-full blur-2xl" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section (Restyled) */}
        <section className="mb-20 relative">
          <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,192,203,0.25),transparent_60%)]" />
            <div className="relative z-10">
              <h2 className="text-center text-5xl md:text-6xl font-black mb-14">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent">Why Families Love Us</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  { icon: '🎉', title: 'Epic Fun Guarantee', text: 'Designed for magical moments & endless laughter.' },
                  { icon: '⚡', title: 'Lightning Fast Booking', text: 'In just a few clicks your date is locked in.' },
                  { icon: '💎', title: 'Flexible & Fair', text: 'Small deposit now, pay balance on party day.' },
                  { icon: '🛠️', title: 'Full Party Service', text: 'We handle setup, hosting, and cleanup.' }
                ].map((item, i) => (
                  <div key={i} className="group relative text-center px-4">
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center text-5xl rounded-2xl bg-gradient-to-br from-pink-500/20 to-yellow-400/20 group-hover:from-pink-500/30 group-hover:to-yellow-400/30 transition-all">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-black text-brown-dark mb-3 tracking-tight">{item.title}</h3>
                    <p className="font-playful text-brown-700 text-sm leading-relaxed max-w-[14ch] mx-auto">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section (Restyled) */}
        <section className="mb-20">
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-yellow-400 to-pink-600 opacity-90" />
            <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />
            <div className="relative z-10 p-12 text-center text-white">
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight drop-shadow-xl">
                Ready To Celebrate?
              </h2>
              <p className="font-playful text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed">
                Join hundreds of families creating unforgettable memories. Your perfect party is one click away!
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href={`/${tenant}/book`}
                  className="bg-white text-pink-600 font-black text-lg md:text-xl px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-4 border-white/80 hover:border-yellow-300"
                >
                  🚀 Start Your Party Adventure
                </Link>
                <a
                  href="tel:15557278938"
                  className="bg-yellow-300 text-pink-700 font-black text-lg md:text-xl px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-4 border-yellow-300 hover:border-white"
                >
                  📞 (555) PARTY-FUN
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial (Restyled) */}
        <section className="mt-24 mb-12">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-600 rounded-3xl blur opacity-40" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/60">
              <div className="flex flex-col items-center text-center">
                <div className="text-6xl mb-4 tracking-wider bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">★★★★★</div>
                <blockquote className="font-playful text-brown-700 text-lg md:text-xl italic leading-relaxed mb-6">
                  “Best party ever! The kids had a blast and I didn’t worry about a thing. Staff was amazing and the room was perfect!”
                </blockquote>
                <div className="font-black text-pink-600 text-lg">— Sarah M. (Happy Mom)</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
