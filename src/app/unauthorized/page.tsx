"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const tenant = searchParams?.get("tenant") || "this company";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access {tenant}.
            </p>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Go to My Dashboard
              </a>
              <a
                href="/auth/login"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Sign In with Different Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
