 'use client'
import dynamic from 'next/dynamic'
import CharacterSection from '@/components/layout/CharacterSection'

// Load Rive on the client only
const RiveAnimation = dynamic(() => import('@/components/RiveAnimation'), { ssr: false })

export default function GreetingScene() {
  return (
    <div className="w-full h-full relative px-4 z-40 pt-28 md:pt-36">
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-4 place-items-center">
        {/* Row 1: Logo (single column) */}
        <div className="w-full flex justify-center mt-2 md:mt-4 lg:mt-6">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className="h-[72px] sm:h-24 md:h-28 w-auto drop-shadow"
          />
        </div>
      </div>
      <div
        className="absolute inset-x-0 z-40 px-4 bottom-[120px] md:bottom-[84px] lg:bottom-[64px]"
      >
        <div className="max-w-5xl mx-auto">
          {/* Mobile: larger Ruffs scale */}
          <div className="block md:hidden">
            <CharacterSection
              className="pointer-events-none"
              wizzy={{
                src: '/assets/greeting/wizzygreetintgvideo.webp',
                alt: 'Wizzy greeting',
                scale: 1,
              }}
              ruffs={{
                src: '/assets/greeting/ruffsgreetingvideo.webp',
                alt: 'Ruffs greeting',
                scale: 1.05,
              }}
            />
          </div>
          {/* Desktop/tablet: previous scale */}
          <div className="hidden md:block">
            <CharacterSection
              className="pointer-events-none"
              wizzy={{
                src: '/assets/greeting/wizzygreetintgvideo.webp',
                alt: 'Wizzy greeting',
                scale: 1,
              }}
              ruffs={{
                src: '/assets/greeting/ruffsgreetingvideo.webp',
                alt: 'Ruffs greeting',
                scale: 0.85,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
