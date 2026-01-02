'use client';

import { motion } from 'framer-motion';

interface TuwaLoaderProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  text?: string;
}

export function TuwaLoader({ size = 'medium', showText = true, text = 'Loading...' }: TuwaLoaderProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const containerSizeClasses = {
    small: 'gap-2',
    medium: 'gap-3',
    large: 'gap-4',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className="w-full flex justify-center items-center bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] min-h-[calc(100dvh-65px)]">
      <div className={`flex flex-col items-center ${containerSizeClasses[size]}`}>
        {/* Spinning loader with TUWA gradient */}
        <div className="relative">
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] opacity-20`}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent`}
            style={{
              backgroundImage: `linear-gradient(var(--tuwa-bg-primary), var(--tuwa-bg-primary)), 
                               linear-gradient(45deg, var(--tuwa-button-gradient-from), var(--tuwa-button-gradient-to))`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Inner pulsing dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)]`}
            />
          </motion.div>
        </div>

        {/* Loading text with animation */}
        {showText && (
          <motion.p
            className={`${textSizeClasses[size]} font-medium text-[var(--tuwa-text-primary)] text-center`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {text}
          </motion.p>
        )}

        {/* Animated dots */}
        {showText && (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-[var(--tuwa-text-secondary)]"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
