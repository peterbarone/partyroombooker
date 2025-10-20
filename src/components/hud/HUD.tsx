"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

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
  children,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Top: progress + hold */}
      {showProgress && (
        <div className="sticky top-0 z-20 px-3 pt-3 pb-2 bg-white/70 backdrop-blur-md rounded-2xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Step {currentStep + 1} / {totalSteps}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-amber-700 tracking-wide">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-amber-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            />
          </div>

          {holdId && (
            <div
              className={`mt-3 rounded-xl px-3 py-2 text-center border ${
                (holdRemaining ?? 0) <= 60
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-amber-500 bg-amber-50 text-amber-800"
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

      {/* Content */}
      <div className={`flex-1 px-2 md:px-4 py-4 ${contentOverflowY === 'visible' ? 'overflow-visible' : 'overflow-y-auto'}`}>
        <div className="mx-auto w-full max-w-[420px] h-full">
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      {showNav && (
        <div className="px-2 md:px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
          <div className="mx-auto w-full max-w-[420px] flex items-center justify-between gap-2">
            <button
              onClick={onPrev}
              aria-label="Back"
              className="relative flex-none w-24 h-24 sm:w-24 sm:h-24 md:w-24 md:h-24 disabled:opacity-40"
              style={{ backgroundImage: "url('/assets/backbutton.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}
            >
              <span className="sr-only">Back</span>
            </button>
            {/* Center scroll image constrained to content width */}
            <div
              aria-hidden
              className="flex-none w-56 h-56 sm:w-56 sm:h-56 md:w-56 md:h-56"
              style={{ backgroundImage: "url('/assets/rolledscroll.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}
            />
            <button
              onClick={onNext}
              aria-label="Next"
              disabled={!!isNextDisabled}
              className="relative flex-none w-24 h-24 sm:w-24 sm:h-24 md:w-24 md:h-24 disabled:opacity-40"
              style={{ backgroundImage: "url('assets/nextbutton.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center' }}
            >
              <span className="sr-only">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
