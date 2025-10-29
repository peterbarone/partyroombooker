"use client";
import { useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type Props = {
  src: string; // e.g. "/greeting/intro.riv" (must be in public/)
  artboard?: string;
  animation?: string; // single animation name
  stateMachine?: string; // single state machine name
  autoplay?: boolean;
  className?: string;
  onLoad?: () => void;
};

/**
 * RiveAnimation - wrapper around @rive-app/react-canvas for client-side usage in Next.js
 * - Put your .riv under the public/ folder and pass its public path via `src`
 * - Prefer `stateMachine` when available; else pass a single `animation` name
 */
export default function RiveAnimation({
  src,
  artboard,
  animation,
  stateMachine,
  autoplay = true,
  className = "",
  onLoad,
}: Props) {
  const { RiveComponent, rive } = useRive({
    src,
    artboard,
    animations: animation ? [animation] : undefined,
    stateMachines: stateMachine ? [stateMachine] : undefined,
    autoplay,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  useEffect(() => {
    if (rive && onLoad) onLoad();
  }, [rive, onLoad]);

  return (
    <div className={className}>
      <RiveComponent />
    </div>
  );
}
