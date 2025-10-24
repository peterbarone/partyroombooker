'use client';

import Image from 'next/image';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export type ScrollUnrollHandle = {
  /** Play the unroll animation (replays if already open). */
  play: () => void;
  /** Instantly reset to the pre-roll state. */
  reset: () => void;
};

type Props = {
  /** Open parchment PNG (transparent background). Defaults to /assets/scroll-open.png */
  openSrc?: string;
  /** Rolled parchment PNG (transparent background). Defaults to /assets/scroll-rolled.png */
  rolledSrc?: string;
  /** Accessible alt text for both images. */
  alt?: string;

  /**
   * Aspect ratio (width / height). Defaults to ~0.83 to fit your sample asset.
   * The container uses CSS `aspect-ratio` to keep width consistent across breakpoints.
   */
  aspect?: number;

  /** Max rendered width in px (use Tailwind classes via `className` for finer control). */
  maxWidth?: number;

  /** Add a gentle idle “paper breathe” after unroll (default true). */
  idle?: boolean;

  /** Auto-play on mount (default true). */
  playOnMount?: boolean;

  /** If true, clicking after first play won’t replay (default false). */
  once?: boolean;

  /** Extra classes for outer wrapper. */
  className?: string;

  /** Called when the unroll animation completes. */
  onComplete?: () => void;

  /** Visual fit: scale factor to make OPEN image match ROLLED perceived size (default 1.08). */
  openFitScale?: number;
  /** Visual fit: vertical offset in px for OPEN image (default -6). */
  openYOffset?: number;
  /** Visual fit: scale factor for ROLLED image (default 1.0). */
  rolledFitScale?: number;
  /** Visual fit: vertical offset in px for ROLLED image (default 0). */
  rolledYOffset?: number;
  /** Next/Image sizes string when using fill, to match rendered width (improves perf). */
  sizes?: string;
};

const ScrollUnroll = forwardRef<ScrollUnrollHandle, Props>(function ScrollUnroll(
  {
    openSrc = "/assets/scroll-open.png",
    rolledSrc = "/assets/scroll-rolled.png",
    alt = 'Scroll',
    aspect = 0.83,
    maxWidth = 720,
    idle = true,
    playOnMount = true,
    once = false,
    className = '',
    onComplete,
    openFitScale = 1.08,
    openYOffset = -6,
    rolledFitScale = 1.0,
    rolledYOffset = 0,
    sizes = 'min(92vw, 36rem)',
  },
  ref
) {
  const prefersReduced = useReducedMotion();
  const [playKey, setPlayKey] = useState(0);
  const playedOnceRef = useRef(false);
  const playing = playKey > 0;

  const play = useCallback(() => {
    if (once && playedOnceRef.current) return;
    setPlayKey(k => k + 1);
    playedOnceRef.current = true;
  }, [once]);

  const reset = useCallback(() => {
    playedOnceRef.current = false;
    // Force a re-render without animating by resetting key to baseline
    setPlayKey(0);
  }, []);

  useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);

  // Auto-play on mount
  React.useEffect(() => {
    if (playOnMount) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dur = prefersReduced ? 0.25 : 1.2;
  const ease = [0.22, 1, 0.36, 1] as const;

  const rolledScaleSeq = prefersReduced
    ? undefined
    : [rolledFitScale, rolledFitScale * 1.02, rolledFitScale * 0.98];

  return (
    <div
      className={`relative mx-auto select-none ${className}`}
      style={{
        maxWidth,
        aspectRatio: `${aspect} / 1`,
      }}
      role="button"
      tabIndex={0}
      aria-label="Toggle scroll (click to unroll, click again to roll)"
      onClick={() => (playing ? reset() : play())}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (playing) reset(); else play();
        }
      }}
    >
      {/* Expandable stage */}
      <div className="absolute inset-0 overflow-visible">
        {/* Ground shadow to “ground” the prop */}
        {playing ? (
          <motion.div
            key={`shadow-${playKey}`}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              bottom: '4%',
              width: '72%',
              height: '8%',
              filter: 'blur(10px)',
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 70%)',
            }}
            initial={{ scaleX: 0.5, opacity: 0.6 }}
            animate={{
              scaleX: prefersReduced ? 0.8 : [0.5, 1.05, 0.95],
              opacity: [0.6, 0.75, 0.65],
            }}
            transition={{ duration: dur, ease }}
          />
        ) : (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              bottom: '4%',
              width: '72%',
              height: '8%',
              filter: 'blur(10px)',
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 70%)',
              opacity: 0.65,
            }}
          />
        )}

        {/* OPEN SCROLL — clipPath reveal + tiny overshoot; scaled/offset for visual match */}
        <motion.div
          key={`open-${playKey}`}
          className="absolute inset-0"
          initial={{
            clipPath: 'inset(0 95% 0 0 round 12px)',
            scaleX: 0.98,
            scale: openFitScale * 0.98,
            y: openYOffset,
            transformOrigin: 'left center',
            opacity: playing ? 1 : 0,
          }}
          animate={
            playing
              ? prefersReduced
                ? { clipPath: 'inset(0 0% 0 0 round 12px)', scaleX: 1, scale: openFitScale, y: openYOffset, opacity: 1 }
                : {
                    clipPath: [
                      'inset(0 95% 0 0 round 12px)',
                      'inset(0 0% 0 0 round 12px)',
                      'inset(0 0% 0 0 round 12px)',
                    ],
                    scaleX: [0.98, 1.02, 1],
                    scale: [openFitScale * 0.98, openFitScale * 1.02, openFitScale],
                    y: [openYOffset, openYOffset, openYOffset],
                    opacity: [1, 1, 1],
                  }
              : undefined
          }
          transition={{ duration: dur, ease }}
          onAnimationComplete={() => onComplete?.()}
          style={{ willChange: 'clip-path, transform, opacity' }}
        >
          <Image
            src={openSrc}
            alt={alt}
            fill
            sizes={sizes}
            priority
            className="object-contain"
          />
        </motion.div>

        {/* ROLLED SCROLL — tilt + slide out as if it unrolls; scaled/offset for visual match */}
        <AnimatePresence>
          {playing ? (
            <motion.div
              key={`rolled-${playKey}`}
              className="absolute inset-0"
              initial={{ x: 0, y: rolledYOffset, rotate: 0, opacity: 1, scale: rolledFitScale }}
              animate={
                prefersReduced
                  ? { opacity: 0 }
                  : {
                      x: [0, 8, -220],
                      y: [rolledYOffset, rolledYOffset - 4, rolledYOffset - 6],
                      rotate: [0, -6, -10],
                      scale: rolledScaleSeq,
                      opacity: [1, 1, 0],
                    }
              }
              transition={{ duration: dur, ease }}
              exit={{ opacity: 0 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <Image
                src={rolledSrc}
                alt={alt}
                fill
                sizes={sizes}
                className="object-contain"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0" style={{ transform: `translateY(${rolledYOffset}px) scale(${rolledFitScale})` }}>
              <Image
                src={rolledSrc}
                alt={alt}
                fill
                sizes={sizes}
                className="object-contain"
              />
            </div>
          )}
        </AnimatePresence>

        {/* Optional idle “paper breathe” after open */}
        {idle && !prefersReduced && (
          <motion.div
            // Idle layer only applies a subtle transform to the open scroll via an overlayed, pointer-null div.
            className="absolute inset-0 pointer-events-none"
            animate={{ scale: [1, 1.005, 1], rotate: [-0.15, 0.15, -0.15] }}
            transition={{ duration: 6.0, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
});

export default ScrollUnroll;
