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
      className="flex items-center gap-2 px-2 py-1 rounded-full bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-tertiary)] border border-[var(--tuwa-border-primary)] transition-all cursor-pointer group"
      title="Refresh quote"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="transparent"
            stroke="var(--tuwa-border-primary)"
            strokeWidth="2"
          />
           {/* Progress circle */}
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="transparent"
            stroke="var(--tuwa-button-gradient-from)"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
             className={isLoading ? 'opacity-0' : 'transition-all duration-100 ease-linear'}
          />
        </svg>
        <ArrowPathIcon 
            className={`absolute w-2.5 h-2.5 text-[var(--tuwa-text-primary)] ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
        />
      </div>
      <span className="text-[10px] font-mono text-[var(--tuwa-text-secondary)] w-8 text-right">
        {Math.ceil(timeLeft / 1000)}s
      </span>
    </button>
  );
}
