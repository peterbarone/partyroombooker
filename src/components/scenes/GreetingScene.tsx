 'use client'
import dynamic from 'next/dynamic'

// Load Rive on the client only
const RiveAnimation = dynamic(() => import('@/components/RiveAnimation'), { ssr: false })

export default function GreetingScene() {
  return (
    <div className="w-full h-full relative flex items-start justify-center px-4 z-40 pt-40">
      {/* Logo */}
      <div className="flex justify-center">
        <img
          src="/assets/logo.png"
          alt="Company Logo"
          className="h-[72px] sm:h-24 md:h-28 w-auto drop-shadow"
        />
      </div>

    </div>
  );
}
