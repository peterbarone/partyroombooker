import Link from "next/link";

interface TenantHomeProps {
  params: { tenant: string };
}

export default async function TenantHome({ params }: TenantHomeProps) {
  const { tenant } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Book your perfect party space online with instant confirmation
          </p>

          <Link
            href={`/${tenant}/book`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 inline-block"
          >
            Book Your Party Now
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose Your Date
              </h3>
              <p className="text-gray-600">
                Pick your perfect party date and time
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select Package & Room
              </h3>
              <p className="text-gray-600">
                Choose from our party packages and available rooms
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pay Deposit
              </h3>
              <p className="text-gray-600">
                Secure your booking with a 50% deposit
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Why Book With Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h4 className="font-semibold text-gray-900">Fun Guarantee</h4>
              <p className="text-sm text-gray-600">
                Unforgettable parties every time
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h4 className="font-semibold text-gray-900">Easy Booking</h4>
              <p className="text-sm text-gray-600">
                Book online in just minutes
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💳</div>
              <h4 className="font-semibold text-gray-900">Flexible Payment</h4>
              <p className="text-sm text-gray-600">
                Pay deposit now, balance later
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-semibold text-gray-900">Full Service</h4>
              <p className="text-sm text-gray-600">We handle all the details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
