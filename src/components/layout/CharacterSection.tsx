"use client";
import React from "react";
import { motion } from "framer-motion";

type CharacterData = {
  src: string;
  alt: string;
  scale?: number;
  isVideo?: boolean;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
};

type Props = {
  wizzy?: CharacterData;
  ruffs?: CharacterData;
  className?: string;
};

/**
 * CharacterSection - Displays Wizzy and Ruffs side-by-side as content blocks
 * Part of the fixed layout refactor to solve responsive issues
 */
export default function CharacterSection({ wizzy, ruffs, className = "" }: Props) {
  if (!wizzy && !ruffs) return null;

  return (
    <div className={`character-section ${className}`}>
      <div className="character-grid w-full flex items-end justify-between gap-2">
        {wizzy && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="character-card wizzy-card"
            style={{ width: "40%", maxWidth: "40%" }}
          >
            <div className="character-content">
              <div
                className="character-image-wrapper"
                style={{
                  transform: `scale(${wizzy.scale ?? 1})`,
                  height: "300px",
                  maxHeight: "300px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {wizzy.isVideo ? (
                  <video
                    src={wizzy.src}
                    className="character-image"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    playsInline
                    autoPlay={wizzy.autoPlay ?? true}
                    loop={wizzy.loop ?? true}
                    muted={wizzy.muted ?? true}
                    controls={wizzy.controls ?? false}
                    poster={wizzy.poster}
                  />
                ) : (
                  <img
                    src={wizzy.src}
                    alt={wizzy.alt}
                    className="character-image"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    draggable={false}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {ruffs && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="character-card ruffs-card"
            style={{ width: "40%", maxWidth: "40%" }}
          >
            <div className="character-content">
              <div
                className="character-image-wrapper"
                style={{
                  transform: `scale(${ruffs.scale ?? 1})`,
                  height: "300px",
                  maxHeight: "300px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ruffs.isVideo ? (
                  <video
                    src={ruffs.src}
                    className="character-image"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    playsInline
                    autoPlay={ruffs.autoPlay ?? true}
                    loop={ruffs.loop ?? true}
                    muted={ruffs.muted ?? true}
                    controls={ruffs.controls ?? false}
                    poster={ruffs.poster}
                  />
                ) : (
                  <img
                    src={ruffs.src}
                    alt={ruffs.alt}
                    className="character-image"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    draggable={false}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
