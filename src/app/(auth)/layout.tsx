import type { Metadata } from "next";
import React from "react";
import "@/styles/website.css";

export const metadata: Metadata = {
  title: "Authentication - Party Room Booker",
  description: "Sign in or create your account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="website-root">
      <div className="website-scroll py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🎉 Party Room Booker</h1>
            <p className="text-gray-600">Sign in or create your account</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md website-card p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
