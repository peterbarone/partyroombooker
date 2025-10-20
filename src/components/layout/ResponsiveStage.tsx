// components/layout/ResponsiveStage.tsx
'use client'
import { ReactNode } from 'react'

type Props = {
  bgMobile: string
  bgTablet: string
  bgDesktop: string
  children?: ReactNode          // characters / midground
  hud?: ReactNode               // buttons, summary, etc.
}

export default function ResponsiveStage({ bgMobile, bgTablet, bgDesktop, children, hud }: Props) {
  return (
    <div className="relative w-full h-dvh overflow-hidden">
      {/* Background: art-directed sources without Next/Image optimizer */}
      <picture>
        <source media="(max-width: 767px)" srcSet={bgMobile} />
        <source media="(max-width: 1023px)" srcSet={bgTablet} />
        <img
          src={bgDesktop}
          alt="Background"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      </picture>
      {/* Midground / characters */}
      <div className="pointer-events-none absolute inset-0">
        {children}
      </div>

      {/* HUD / UI (centered phone-sized column) */}
      <div className="pointer-events-auto absolute inset-0 p-4 md:p-6 lg:p-8 pb-[calc(theme(spacing.4)+env(safe-area-inset-bottom))]">
        <div className="w-full h-full flex justify-center">
          <div className="@container w-full h-full max-w-[420px]">
            {hud}
          </div>
        </div>
      </div>
    </div>
  )
}
