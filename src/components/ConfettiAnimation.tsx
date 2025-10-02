"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  active?: boolean;
  duration?: number;
  intensity?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  emoji?: string;
  delay: number;
  duration: number;
}

const CONFETTI_COLORS = [
  '#FF6B9D', // party pink
  '#9B59B6', // party purple  
  '#3498DB', // party blue
  '#F1C40F', // party yellow
  '#E67E22', // party orange
  '#2ECC71', // party green
];

const CONFETTI_EMOJIS = ['🎉', '🎊', '⭐', '✨', '🎈', '🎂', '🌟', '💫'];

export default function ConfettiAnimation({ 
  active = false, 
  duration = 3000,
  intensity = 50 
}: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const pieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < intensity; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          emoji: Math.random() > 0.7 ? CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)] : undefined,
          delay: Math.random() * 2,
          duration: 2 + Math.random() * 2,
        });
      }
      
      setConfettiPieces(pieces);
      
      // Clear confetti after duration
      const timer = setTimeout(() => {
        setConfettiPieces([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, duration, intensity]);

  if (!active || confettiPieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-10px',
          }}
          initial={{
            y: -10,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: 720,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        >
          {piece.emoji ? (
            <span className="text-2xl">{piece.emoji}</span>
          ) : (
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Party Celebration Component with Sound Effects
export const PartyCelebration = ({ 
  trigger, 
  onComplete 
}: { 
  trigger: boolean; 
  onComplete?: () => void; 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      
      // Add fireworks effect after a delay
      const fireworksTimer = setTimeout(() => {
        setShowFireworks(true);
      }, 500);
      
      // Complete celebration
      const completeTimer = setTimeout(() => {
        setShowConfetti(false);
        setShowFireworks(false);
        onComplete?.();
      }, 4000);
      
      return () => {
        clearTimeout(fireworksTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [trigger, onComplete]);

  return (
    <>
      <ConfettiAnimation active={showConfetti} intensity={100} duration={4000} />
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0], 
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            >
              🎆
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};