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
  xs: { cqw: "clamp(110px, 18cqw, 180px)", vw: "clamp(110px, 12vw, 220px)" },
  sm: { cqw: "clamp(140px, 22cqw, 240px)", vw: "clamp(140px, 16vw, 280px)" },
  md: { cqw: "clamp(170px, 26cqw, 300px)", vw: "clamp(170px, 20vw, 360px)" },
  lg: { cqw: "clamp(200px, 30cqw, 360px)", vw: "clamp(200px, 24vw, 440px)" },
  xl: { cqw: "clamp(220px, 34cqw, 420px)", vw: "clamp(240px, 28vw, 560px)" },
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
  // Compute width expression
  let width = SIZE_PRESETS[preset][units];
  if (typeof minPx === "number" && typeof maxPx === "number" && (typeof vwPercent === "number" || typeof cqwPercent === "number")) {
    const vwExpr = typeof vwPercent === "number" ? `${vwPercent}vw` : undefined;
    const cqwExpr = typeof cqwPercent === "number" ? `${cqwPercent}cqw` : undefined;
    const middle = vwExpr && cqwExpr ? `min(${vwExpr}, ${cqwExpr})` : (vwExpr || cqwExpr)!;
    width = `clamp(${minPx}px, ${middle}, ${maxPx}px)`;
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
