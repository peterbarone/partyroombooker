// components/layout/ResponsiveStage.tsx
'use client'
import { ReactNode } from 'react'

type Props = {
  bgMobile: string
  bgTablet: string
  bgDesktop: string
  children?: ReactNode          // scene midground layer (behind HUD)
  hud?: ReactNode               // main HUD: progress, nav, content
  hudChars?: ReactNode          // new layer: characters positioned within HUD overlay
}

export default function ResponsiveStage({ bgMobile, bgTablet, bgDesktop, children, hud, hudChars }: Props) {
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

      {/* Midground / scene visuals (behind HUD) */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {children}
      </div>

      {/* HUD overlay */}
      <div className="pointer-events-auto absolute inset-0 z-30 px-4 md:px-6 lg:px-8 pt-[calc(theme(spacing.4)+env(safe-area-inset-top))] md:pt-[calc(theme(spacing.6)+env(safe-area-inset-top))] lg:pt-[calc(theme(spacing.8)+env(safe-area-inset-top))] pb-[calc(theme(spacing.4)+env(safe-area-inset-bottom))] md:pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))] lg:pb-[calc(theme(spacing.8)+env(safe-area-inset-bottom))]">
        {/* Fixed characters layer aligned to HUD container */}
        {hudChars && (
          <div className="pointer-events-none fixed inset-0 z-40">
            <div className="w-full h-full flex justify-center">
              <div className="@container w-full h-full max-w-[420px] relative">
                {hudChars}
              </div>
            </div>
          </div>
        )}
        {/* Main HUD column (phone-sized) */}
        <div className="w-full h-full flex justify-center relative z-50">
          <div className="@container w-full h-full max-w-[420px]">
            {hud}
          </div>
        </div>
      </div>
    </div>
  )
}
