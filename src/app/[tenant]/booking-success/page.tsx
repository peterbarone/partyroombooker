import { Suspense } from "react";

interface BookingSuccessPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function BookingSuccessContent({
  tenant,
  orderRef,
}: {
  tenant: string;
  orderRef: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Your party booking has been confirmed and payment has been
            processed. You&apos;ll receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What&apos;s Next?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Complete your waiver (required)
                  </p>
                  <p className="text-sm text-gray-600">
                    All party participants must have a signed waiver
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Check your email
                  </p>
                  <p className="text-sm text-gray-600">
                    We&apos;ve sent booking details and party information
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Arrive 15 minutes early
                  </p>
                  <p className="text-sm text-gray-600">
                    This allows time for setup and final preparations
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Order Reference: {orderRef}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${tenant}/waiver/${orderRef}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
              >
                Complete Waiver
              </a>
              <a
                href={`/${tenant}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
              >
                Back to Home
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions about your booking?{" "}
              <a
                href="mailto:info@partyroombooker.com"
                className="text-blue-600 hover:text-blue-700"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: BookingSuccessPageProps) {
  const { tenant } = await params;
  const { ref: orderRef } = await searchParams;

  if (!orderRef || typeof orderRef !== "string") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Invalid Booking Reference
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              We couldn&apos;t find the booking reference. Please check your
              email for the correct link.
            </p>
            <a
              href={`/${tenant}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Confirming your booking...</p>
          </div>
        </div>
      }
    >
      <BookingSuccessContent tenant={tenant} orderRef={orderRef} />
    </Suspense>
  );
}
