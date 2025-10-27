"use client";
import React from "react";

type SizePreset = "xs" | "sm" | "md" | "lg" | "xl";
type Unit = "cqw" | "vw";

type Props = {
  src: string;
  alt: string;
  anchor?: "left" | "right";
  preset?: SizePreset;
  bottom?: string; // e.g. '5rem' or 'calc(10px + 2dvh)'
  offset?: string; // horizontal offset from the anchored side, e.g. '-20px'
  scale?: number; // multiplier to fine-tune per page
  units?: Unit; // sizing unit for clamp preferred value (container width or viewport width)
  // Advanced sizing (overrides preset/units when provided)
  minPx?: number;     // e.g. 200
  maxPx?: number;     // e.g. 520
  vwPercent?: number; // e.g. 28 -> '28vw'
  cqwPercent?: number;// e.g. 34 -> '34cqw'
  className?: string;
  style?: React.CSSProperties;
};

const SIZE_PRESETS: Record<SizePreset, { cqw: string; vw: string }> = {
  xs: { cqw: "clamp(84px, 16cqw, 150px)", vw: "clamp(84px, 10vw, 180px)" },
  sm: { cqw: "clamp(110px, 20cqw, 200px)", vw: "clamp(110px, 14vw, 240px)" },
  md: { cqw: "clamp(130px, 22cqw, 260px)", vw: "clamp(130px, 18vw, 300px)" },
  lg: { cqw: "clamp(160px, 26cqw, 320px)", vw: "clamp(160px, 22vw, 380px)" },
  xl: { cqw: "clamp(180px, 30cqw, 380px)", vw: "clamp(200px, 26vw, 480px)" },
};

export default function HudCharacter({
  src,
  alt,
  anchor = "left",
  preset = "md",
  bottom = "6rem",
  offset,
  scale = 1,
  units = "cqw",
  minPx,
  maxPx,
  vwPercent,
  cqwPercent,
  className = "",
  style,
}: Props) {
  const supportsContainerUnits =
    typeof window !== "undefined" &&
    typeof window.CSS !== "undefined" &&
    typeof window.CSS.supports === "function" &&
    window.CSS.supports("width", "1cqw");

  // Compute width expression
  const unitKey = supportsContainerUnits ? units : "vw";
  let width = SIZE_PRESETS[preset][unitKey];

  const hasMinMax = typeof minPx === "number" && typeof maxPx === "number";
  const hasVw = typeof vwPercent === "number";
  const hasCqw = typeof cqwPercent === "number" && supportsContainerUnits;

  if (hasMinMax && (hasVw || hasCqw)) {
    const vwExpr = hasVw ? `${vwPercent}vw` : undefined;
    const cqwExpr = hasCqw ? `${cqwPercent}cqw` : undefined;

    let middle: string | undefined;
    if (vwExpr && cqwExpr) {
      middle = `min(${vwExpr}, ${cqwExpr})`;
    } else {
      middle = vwExpr ?? cqwExpr;
    }

    if (middle) {
      width = `clamp(${minPx}px, ${middle}, ${maxPx}px)`;
    } else {
      width = `${Math.max(minPx, Math.min(maxPx, minPx))}px`;
    }
  }
  const posStyle: React.CSSProperties = {
    position: "absolute",
    bottom,
    ...(anchor === "left" ? { left: offset ?? "-24px" } : { right: offset ?? "-12px" }),
    width: `calc(${width} * ${scale})`,
    height: "auto",
    pointerEvents: "none",
    userSelect: "none",
    ...style,
  };

  return (
    // Positioned within the HUD overlay's hud-rail @container
    <img src={src} alt={alt} style={posStyle} className={`select-none ${className}`} />
  );
}
