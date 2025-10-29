 'use client'
import dynamic from 'next/dynamic'

// Load Rive on the client only
const RiveAnimation = dynamic(() => import('@/components/RiveAnimation'), { ssr: false })

export default function GreetingScene() {
  return (
    <div className="w-full h-full relative px-4 z-40 pt-40">
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-4 place-items-center">
        {/* Row 1: Logo (single column) */}
        <div className="w-full flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className="h-[72px] sm:h-24 md:h-28 w-auto drop-shadow"
          />
        </div>

        {/* Row 2: Content area below logo (two columns, all screen sizes) */}
        <div className="w-md grid grid-cols-2 items-center justify-items-center">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="/assets/greeting/wizzygreeting.png"
              alt="Wizzy Greeting"
              className="max-h-[350px] w-auto object-contain drop-shadow"
            />
          </div>
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="/assets/greeting/ruffsgreeting.png"
              alt="Ruffs Greeting"
              className="max-h-[250px] w-auto object-contain drop-shadow"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
