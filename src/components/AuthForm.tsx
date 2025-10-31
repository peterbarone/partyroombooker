"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess?: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[AuthForm] Form submitted, mode:", mode);
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        console.log("[AuthForm] Starting signup...");
        const result = await signUp({ email, password, fullName });
        console.log("[AuthForm] Signup result:", result);
        
        // Check if email confirmation is required
        if (result.user && !result.session) {
          console.log("[AuthForm] No session - email confirmation required");
          setError("Please check your email to confirm your account before continuing.");
          setLoading(false);
          return;
        }
        
        // If we have a session, redirect to company setup
        if (result.session) {
          console.log("[AuthForm] Session found! Redirecting to /setup/company");
          alert("Signup successful! Redirecting to company setup...");
          window.location.href = "/setup/company";
          return;
        } else {
          console.log("[AuthForm] No session created");
          setError("Signup succeeded but no session created. Check Supabase settings.");
        }
      } else {
        console.log("[AuthForm] Starting signin...");
        await signIn({ email, password });
        // Call success callback or redirect to dashboard
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("[AuthForm] Error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {mode === "signup" ? "Create Your Account" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
          )}

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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              minLength={6}
            />
            {mode === "signup" && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </a>
            </p>
          ) : (
            <>
              <p className="mb-2">
                Don't have an account?{" "}
                <a
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign Up
                </a>
              </p>
              <p>
                <a
                  href="/auth/forgot-password"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
