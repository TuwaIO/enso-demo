'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface RefreshTimerProps {
  onRefresh: () => void;
  isLoading: boolean;
  intervalMs?: number; // default 60000 (60s)
}

export function RefreshTimer({ onRefresh, isLoading, intervalMs = 60000 }: RefreshTimerProps) {
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(intervalMs);

  useEffect(() => {
    if (isLoading) {
      // eslint-disable-next-line
      setProgress(0); // Reset visual when loading
      setTimeLeft(intervalMs);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + intervalMs;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / intervalMs) * 100;

      setTimeLeft(remaining);
      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(timer);
        onRefresh();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isLoading, intervalMs, onRefresh]);

  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-2 py-1 rounded-full 
        bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)]
        transition-all duration-200 group
        ${
          isLoading
            ? 'cursor-not-allowed opacity-70'
            : 'cursor-pointer hover:bg-[var(--tuwa-bg-muted)] hover:border-gray-300 hover:shadow-sm active:scale-95'
        }
      `}
      title="Refresh quote"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="transparent"
            stroke="var(--tuwa-border-primary)"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="transparent"
            stroke="#f97316"
            strokeWidth="1.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`
              transition-all duration-100 ease-linear
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
          />
        </svg>

        <ArrowPathIcon
          className={`
            absolute w-2.5 h-2.5 text-gray-600 transition-all duration-300
            ${
              isLoading
                ? 'animate-spin text-[var(--tuwa-button-gradient-from)]'
                : 'group-hover:rotate-180 group-hover:text-[var(--tuwa-text-primary)]'
            }
          `}
        />
      </div>

      <span
        className={`
        text-[10px] font-mono w-8 text-right transition-colors duration-200
        ${isLoading ? 'text-gray-400' : 'text-gray-500 group-hover:text-[var(--tuwa-text-primary)]'}
      `}
      >
        {Math.ceil(timeLeft / 1000)}s
      </span>
    </button>
  );
}
