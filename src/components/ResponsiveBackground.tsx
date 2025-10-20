"use client";

import React from 'react';

interface ResponsiveBackgroundProps {
  className?: string;
  overlay?: React.ReactNode;
}

export default function ResponsiveBackground({ className = '', overlay }: ResponsiveBackgroundProps) {
  return (
  <div className={`w-full h-full ${className}`}>
      <picture>
        {/* Use greeting assets in public/assets/greeting/ */}
        <source media="(max-width: 640px)" srcSet="/assets/greeting/bg-mobile.png" />
        <source media="(max-width: 1023px)" srcSet="/assets/greeting/bg-tablet.png" />
        <img src="/assets/greeting/greeting-desktop.png" alt="Party background" className="w-full h-full object-cover object-bottom md:object-center" />
      </picture>
      {overlay}
    </div>
  );
}