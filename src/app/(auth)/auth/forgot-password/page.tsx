"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <a
                href="/auth/login"
                className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Reset Password
          </h2>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <a
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
