import type { Metadata } from "next";
import React from "react";
import "@/styles/website.css";

export const metadata: Metadata = {
  title: "Company Setup - Party Room Booker",
  description: "Set up your company to start managing bookings",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="website-root">
      <div className="website-scroll py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🎉 Party Room Booker</h1>
            <p className="text-gray-600">Let's set up your company in a few steps</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
