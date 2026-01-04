'use client';

import { ArrowDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SwapButtonProps {
  onSwap: () => void;
}

export function SwapButton({ onSwap }: SwapButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex justify-center items-center my-2 relative">
      <motion.button
        onClick={onSwap}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] flex items-center justify-center cursor-pointer relative overflow-hidden"
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
      >
        {/* Animated background gradient on hover */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] opacity-0"
          animate={{
            opacity: isHovered ? 0.1 : 0,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Default ArrowDown Icon */}
        <motion.div
          className="absolute flex items-center justify-center"
          animate={{
            opacity: isHovered ? 0 : 1,
            y: isHovered ? -10 : 0,
            rotate: isHovered ? -90 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1],
          }}
        >
          <ArrowDownIcon className="w-5 h-5 text-[var(--tuwa-text-primary)]" />
        </motion.div>

        {/* Hover ArrowsUpDown Icon */}
        <motion.div
          className="absolute flex items-center justify-center"
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            rotate: isHovered ? 0 : 90,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1],
            delay: isHovered ? 0.1 : 0,
          }}
        >
          <ArrowsUpDownIcon className="w-5 h-5 text-[var(--tuwa-text-primary)]" />
        </motion.div>

        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[var(--tuwa-text-primary)] opacity-0"
          animate={{
            scale: isHovered ? [1, 1.5] : 1,
            opacity: isHovered ? [0.1, 0] : 0,
          }}
          transition={{
            duration: 0.6,
            repeat: isHovered ? Infinity : 0,
            repeatType: 'loop',
          }}
        />
      </motion.button>
    </div>
  );
}
