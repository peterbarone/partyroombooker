"use client";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

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
  summary?: ReactNode;
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
  summary,
}: Props) {
  const pct = Math.min(100, Math.max(0, ((currentStep + 1) / totalSteps) * 100));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      {/* Top: progress + hold */}
      <div className="hud-top flex items-end justify-center">
        {showProgress && (
          <div className="w-full flex justify-center">
            <div className="hud-rail px-[calc(var(--gap))]">
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
                      animate={{ width: `${pct}%` }}
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
                      {Math.round(pct)}%
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
                  <div className="text-[var(--fz-200)] font-bold">
                    Holding your date, time, and room for {fmtMMSS(holdRemaining ?? 0)}
                  </div>
                  <div className="text-[var(--fz-100)] opacity-80">
                    Please complete checkout or change your selection before it expires.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {title && (
        <div className="w-full flex justify-center">
          <div className="hud-rail px-[calc(var(--gap))] pt-2 pb-2 text-center">
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
        </div>
      )}

      {/* Content */}
      <div
        className={`hud-content scroll-area flex-1 ${contentOverflowY === 'visible' ? 'overflow-visible' : ''}`}
        style={{ paddingInline: 'var(--gap)', paddingBlock: 'calc(var(--gap) / 2)' }}
      >
        <div className="mx-auto hud-rail">
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      {showNav && (
        <div className="hud-bottom relative">
          <div className="h-full w-full flex items-center justify-center">
            <div className="hud-rail flex items-center justify-between">
              <button
                onClick={onPrev}
                aria-label="Back"
                className="btn-icon disabled:opacity-40"
                style={{ backgroundImage: "url('/assets/backbutton.png')" }}
              >
                <span className="sr-only">Back</span>
              </button>
              {/* Center: Summary drawer toggle + panel (relative anchor) */}
              <div className="flex-none relative w-[min(60vw,18rem)]">
                <button
                  type="button"
                  onClick={() => setDrawerOpen((v) => !v)}
                  aria-expanded={drawerOpen}
                  aria-controls="hud-summary-drawer"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-between"
                >
                  <span>Party Summary</span>
                  {drawerOpen ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {drawerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      id="hud-summary-drawer"
                      className="absolute bottom-full mb-2 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-amber-200 p-4 max-h-96 overflow-y-auto z-50"
                      role="region"
                      aria-label="Party summary"
                    >
                      <h3 className="font-bold text-lg text-amber-900 border-b-2 border-amber-200 pb-2 mb-3">Booking Details</h3>
                      {summary ?? (
                        <div className="text-center text-sm opacity-80 py-3">No selections yet</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={onNext}
                aria-label="Next"
                disabled={!!isNextDisabled}
                className="btn-icon disabled:opacity-40"
                style={{ backgroundImage: "url('/assets/nextbutton.png')" }}
              >
                <span className="sr-only">Next</span>
              </button>
            </div>
          </div>
          {/* Drawer is anchored to the center button above */}
        </div>
      )}
    </div>
  );
}
