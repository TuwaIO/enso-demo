'use client';

import { motion } from 'framer-motion';

interface TuwaSpinnerProps {
  size?: number;
  className?: string;
}

export function TuwaSpinner({ size = 24, className = '' }: TuwaSpinnerProps) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          backgroundImage: `linear-gradient(transparent, transparent), 
                           linear-gradient(45deg, var(--tuwa-button-gradient-from), var(--tuwa-button-gradient-to))`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Inner dot */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="rounded-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)]"
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      </motion.div>
    </div>
  );
}
