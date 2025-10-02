"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface WaiverPageProps {
  params: Promise<{
    tenant: string;
    bookingId: string;
  }>;
}

export default function WaiverPage({ params }: WaiverPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    tenant: string;
    bookingId: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    acknowledged: false,
  });
  const [signature, setSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const { tenant, bookingId } = resolvedParams;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !signature ||
      !formData.acknowledged
    ) {
      alert("Please fill in all required fields and sign the waiver.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsCompleted(true);
    } catch (error) {
      alert("Error submitting waiver. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToBooking = () => {
    router.push(`/${tenant}/book`);
  };

  const handleGoHome = () => {
    router.push(`/${tenant}`);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Waiver Completed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for signing the waiver for booking #{bookingId}. Your
              waiver has been recorded and you&apos;re all set for your party!
            </p>
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Return to Home
              </button>
              <button
                onClick={handleReturnToBooking}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Book Another Party
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Party Waiver
            </h1>
            <p className="text-gray-600">
              Please review and sign the waiver for booking #{bookingId}
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Liability Waiver and Release
              </h2>

              <div className="prose prose-sm text-gray-700 space-y-4">
                <p>
                  I understand that participation in party activities involves
                  certain risks and I voluntarily assume all such risks for
                  myself and my child(ren).
                </p>

                <p>
                  I hereby release, waive, discharge and covenant not to sue{" "}
                  {tenant}
                  and its owners, employees, and agents from any and all
                  liability, claims, demands, actions and causes of action
                  whatsoever arising out of or related to any loss, damage, or
                  injury that may be sustained by my child(ren) or myself while
                  participating in activities.
                </p>

                <p>
                  I acknowledge that I have read this waiver and understand its
                  contents, and I sign it voluntarily as my own free act and
                  deed.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Electronic Signature *
                </label>
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <input
                    type="text"
                    value={signature}
                    onChange={handleSignatureChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-cursive text-lg"
                    placeholder="Type your full name as your signature"
                    style={{ fontFamily: "cursive" }}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    By typing your name above, you are providing your electronic
                    signature
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acknowledge"
                  name="acknowledged"
                  required
                  checked={formData.acknowledged}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label
                  htmlFor="acknowledge"
                  className="ml-2 text-sm text-gray-700"
                >
                  I acknowledge that I have read, understood, and agree to the
                  terms of this waiver. I understand that this electronic
                  signature has the same legal effect as a handwritten
                  signature. *
                </label>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.name ||
                    !formData.email ||
                    !signature ||
                    !formData.acknowledged
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                >
                  {isSubmitting ? "Submitting..." : "Sign Waiver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
