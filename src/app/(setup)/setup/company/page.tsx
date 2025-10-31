"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanySetupForm from "@/components/CompanySetupForm";
import { getUser } from "@/lib/auth";

export default function CompanySetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Setup page: Checking auth...");
      const user = await getUser();
      console.log("Setup page: User:", user);
      
      if (!user) {
        console.log("Setup page: No user found, redirecting to signup");
        // Not logged in, redirect to signup
        router.push("/auth/signup");
      } else {
        console.log("Setup page: User authenticated, showing form");
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Welcome to Party Room Booker!
          </h1>
          <p className="text-lg text-gray-600">
            Let's get your booking platform set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                ✓
              </div>
              <span className="text-sm text-gray-600">Account Created</span>
            </div>
            <div className="flex-1 h-1 bg-blue-600"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                2
              </div>
              <span className="text-sm font-medium text-gray-900">
                Company Info
              </span>
            </div>
            <div className="flex-1 h-1 bg-gray-300"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <span className="text-sm text-gray-600">Payment Setup</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <CompanySetupForm />
      </div>
    </div>
  );
}
