// components/layout/ResponsiveStage.tsx
'use client'
import { ReactNode } from 'react'

type Props = {
  bgMobile: string
  bgTablet: string
  bgDesktop: string
  children?: ReactNode          // scene midground layer (behind HUD)
  hud?: ReactNode               // main HUD: progress, nav, content
  hudChars?: ReactNode          // characters positioned within HUD overlay
}

export default function ResponsiveStage({
  bgMobile, bgTablet, bgDesktop, children, hud, hudChars
}: Props) {
  return (
    <div className="relative w-full h-screen-safe overflow-hidden">
      {/* Background (absolute fill, never impacts layout width) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <picture className="block w-full h-full">
          <source media="(max-width: 767px)" srcSet={bgMobile} />
          <source media="(max-width: 1023px)" srcSet={bgTablet} />
          <img
            src={bgDesktop}
            alt=""
            aria-hidden
            className="block w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Midground / scene visuals (behind HUD, non-interactive) */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {children}
      </div>

      {/* HUD overlay (no hard px paddings here; rail handles spacing) */}
      <div className="absolute inset-0 z-30">
        {/* Fixed characters aligned to the rail (overlay) */}
        {hudChars && (
          <div className="pointer-events-none absolute inset-0 z-[10001] flex justify-center">
            <div className="hud-rail @container w-full h-full relative">
              {hudChars}
            </div>
          </div>
        )}

        {/* Main HUD column centered on the rail */}
        <div className="w-full h-full flex justify-center">
          <div
            className="hud-rail @container w-full h-full flex flex-col"
            style={{
              // Provide gentle inline padding via tokens (won’t exceed viewport)
              paddingInline: 'var(--gap)',
              // Top/Bottom “reserved” space; your HUD component also reserves internally,
              // but keeping a little here adds safety on tiny phones / safe areas.
              paddingTop: 'max(calc(var(--gap) / 2), env(safe-area-inset-top))',
              paddingBottom: 'max(calc(var(--gap) / 2), env(safe-area-inset-bottom))',
            }}
          >
            {hud}
          </div>
        </div>
      </div>
    </div>
  )
}
