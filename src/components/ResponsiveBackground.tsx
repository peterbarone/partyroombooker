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
        {/* Mobile-first source for small screens */}
        <source media="(max-width: 640px)" srcSet="/mobilepartybackground-640.webp" type="image/webp" />
        <source media="(max-width: 640px)" srcSet="/mobilepartybackground.png" type="image/png" />

        {/* Desktop responsive sources */}
        <source srcSet="/party-background-1600.webp 1600w, /party-background-1200.webp 1200w, /party-background-800.webp 800w, /party-background-480.webp 480w" type="image/webp" />
        <source srcSet="/party-background-1600.png 1600w, /party-background-1200.png 1200w, /party-background-800.png 800w, /party-background-480.png 480w" type="image/png" />

        <img src="/party-background-1600.png" alt="Party background" className="w-full h-full object-cover object-bottom md:object-center" />
      </picture>
      {overlay}
    </div>
  );
}