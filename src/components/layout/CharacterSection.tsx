"use client";
import React from "react";
import { motion } from "framer-motion";

type CharacterData = {
  src: string;
  alt: string;
  scale?: number;
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
      <div className="character-grid">
        {wizzy && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="character-card wizzy-card"
          >
            <div className="character-content">
              <div
                className="character-image-wrapper"
                style={{ transform: `scale(${wizzy.scale ?? 1})` }}
              >
                <img
                  src={wizzy.src}
                  alt={wizzy.alt}
                  className="character-image"
                  draggable={false}
                />
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
          >
            <div className="character-content">
              <div
                className="character-image-wrapper"
                style={{ transform: `scale(${ruffs.scale ?? 1})` }}
              >
                <img
                  src={ruffs.src}
                  alt={ruffs.alt}
                  className="character-image"
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
