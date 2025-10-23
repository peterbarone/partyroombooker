"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import ScrollUnroll from "@/components/ScrollUnroll";

type Props = {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  showNav?: boolean;
  showProgress?: boolean;
  contentOverflowY?: 'auto' | 'visible';
  showScrollBackdrop?: boolean;
  holdId?: string | null;
  holdRemaining?: number | null;
  fmtMMSS?: (secs: number) => string;
  title?: ReactNode;
  children?: ReactNode;
};

export default function HUD({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isNextDisabled,
  showNav = true,
  showProgress = true,
  contentOverflowY = 'auto',
  showScrollBackdrop = false,
  holdId,
  holdRemaining,
  fmtMMSS = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`,
  title,
  children,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Top: progress + hold */}
      {showProgress && (
        <div className="sticky top-0 z-20 px-3 pt-3 pb-2 bg-transparent rounded-2xl">
          {/* CSS-only stone frame progress bar */}
          <div className="progress-container mx-auto">
            <div className="stone-frame">
              <div className="progress-bg">
                {/* Spiral BG */}
                <div className="spiral-bg" />

                {/* Progress Fill */}
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, ((currentStep + 1) / totalSteps) * 100))}%` }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                />

                {/* Sparkles overlay */}
                <div className="sparkles">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="sparkle"
                      style={{
                        left: `${(i * 71) % 100}%`,
                        top: `${(i * 37) % 100}%`,
                        animationDelay: `${(i * 0.12).toFixed(2)}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Center text (optional) */}
                <div className="progress-text">
                  {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {holdId && (
            <div
              className={`mt-3 rounded-xl px-3 py-2 text-center border ${
                (holdRemaining ?? 0) <= 60
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-amber-500 bg-amber-50 text-amber-800'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">
                Holding your date, time, and room for {fmtMMSS(holdRemaining ?? 0)}
              </div>
              <div className="text-[11px] sm:text-xs opacity-80">
                Please complete checkout or change your selection before it expires.
              </div>
            </div>
          )}
        </div>
      )}

      {title && (
        <div className="px-4 pt-2 pb-2 text-center">
          <div className="hanging-sign mx-auto">
            <div className="rope-left" />
            <div className="rope-right" />
            <div className="wood-sign">
              <span className="nail nail-tl" />
              <span className="nail nail-tr" />
              <span className="nail nail-bl" />
              <span className="nail nail-br" />
              <div className="wood-grain" />
              <div className="sign-title">{title}</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 px-2 md:px-4 py-0 ${contentOverflowY === 'visible' ? 'overflow-visible' : 'overflow-y-auto'}`}>
        <div className="mx-auto w-full max-w-[420px]">
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      {showNav && (
        <div className="px-2 md:px-4 pb-[calc(0px+env(safe-area-inset-bottom))] pt-0 -mt-6 md:-mt-8">
          <div className="mx-auto w-full max-w-[420px] flex items-center justify-between gap-0">
            <button
              onClick={onPrev}
              aria-label="Back"
              className="relative flex-none w-12 h-12 sm:w-[48px] sm:h-[48px] md:w-20 md:h-20 disabled:opacity-40"
              style={{ backgroundImage: "url('/assets/backbutton.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}
            >
              <span className="sr-only">Back</span>
            </button>
            {/* Center animated scroll (non-interactive here) */}
            <div className="flex-none">
              <ScrollUnroll
                className="w-24 sm:w-16 md:w-28"
                playOnMount={false}
              />
            </div>
            <button
              onClick={onNext}
              aria-label="Next"
              disabled={!!isNextDisabled}
              className="relative flex-none w-12 h-12 sm:w-[48px] sm:h-[48px] md:w-20 md:h-20 disabled:opacity-40"
              style={{ backgroundImage: "url('/assets/nextbutton.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}
            >
              <span className="sr-only">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
