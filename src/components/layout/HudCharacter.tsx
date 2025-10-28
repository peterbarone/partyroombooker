"use client";
import React from "react";

type SizePreset = "xs" | "sm" | "md" | "lg" | "xl";
type Unit = "cqw" | "vw";
type Anchor = "left" | "right";

type Props = {
  src: string;
  alt: string;
  anchor?: Anchor;
  preset?: SizePreset;
  bottom?: string;      // e.g. '6rem'
  bottomCQ?: string;    // e.g. '6cqb' (optional container-query floor)
  offset?: string;      // e.g. '10%' or 'clamp(8px, 4vw, 40px)'
  scale?: number;       // transform scale
  units?: Unit;         // kept for backward compat; no longer used for logic
  // Optional hard overrides (keep supporting your current API)
  minPx?: number;
  maxPx?: number;
  vwPercent?: number;
  cqwPercent?: number;
  className?: string;
  style?: React.CSSProperties;
  /** New fine-tuners to “pin the foot” without layout shift */
  translateX?: string;  // e.g. "-50%"
  translateY?: string;  // e.g. "0"
  origin?: string;      // e.g. "50% 100%"
};

const SIZE_PRESETS: Record<SizePreset, { cq: string; vw: string }> = {
  xs: { cq: "clamp(84px, 16cqw, 150px)",  vw: "clamp(84px, 10vw, 180px)" },
  sm: { cq: "clamp(110px, 20cqw, 200px)", vw: "clamp(110px, 14vw, 240px)" },
  md: { cq: "clamp(130px, 22cqw, 260px)", vw: "clamp(130px, 18vw, 300px)" },
  lg: { cq: "clamp(160px, 26cqw, 320px)", vw: "clamp(160px, 22vw, 380px)" },
  xl: { cq: "clamp(180px, 30cqw, 380px)", vw: "clamp(200px, 26vw, 480px)" },
};

export default function HudCharacter({
  src,
  alt,
  anchor = "left",
  preset = "md",
  bottom = "8rem",
  bottomCQ,
  offset,                 // use %/clamp so it scales
  scale = 1,
  // legacy sizing overrides remain supported:
  minPx,
  maxPx,
  vwPercent,
  cqwPercent,
  className = "",
  style,
  translateX = "0",
  translateY = "0",
  origin = "50% 100%",
}: Props) {
  // Build width fallbacks from either overrides or preset
  const fallbackVW =
    typeof minPx === "number" && typeof maxPx === "number" && typeof vwPercent === "number"
      ? `clamp(${minPx}px, ${vwPercent}vw, ${maxPx}px)`
      : SIZE_PRESETS[preset].vw;

  const preferredCQ =
    typeof minPx === "number" && typeof maxPx === "number" && typeof cqwPercent === "number"
      ? `clamp(${minPx}px, ${cqwPercent}cqw, ${maxPx}px)`
      : SIZE_PRESETS[preset].cq;

  const mergedStyle: React.CSSProperties = {
    ["--char-w-vw" as any]: fallbackVW,
    ["--char-w-cq" as any]: preferredCQ,
    ["--char-b" as any]: bottom,
    ...(bottomCQ ? ({ ["--char-b-cq" as any]: bottomCQ } as React.CSSProperties) : {}),
    ["--char-x" as any]: offset ?? "8%",
    ["--char-scale" as any]: String(scale),
    ["--char-tx" as any]: translateX,
    ["--char-ty" as any]: translateY,
    ["--char-origin" as any]: origin,
    ...style,
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`hud-char ${className}`}
      data-anchor={anchor}
      data-size={preset}
      style={mergedStyle}
      draggable={false}
      aria-hidden
    />
  );
}