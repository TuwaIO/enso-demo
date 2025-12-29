'use client';

import { ArrowDownIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

interface SwapButtonProps {
  onSwap: () => void;
}

export function SwapButton({ onSwap }: SwapButtonProps) {
  return (
    <div className="flex justify-center items-center my-2 relative">
      <div className="w-10 h-10 rounded-full bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] flex items-center justify-center">
        <ArrowDownIcon className="w-5 h-5 text-[var(--tuwa-text-primary)]" />
      </div>
      <button
        onClick={onSwap}
        className="absolute right-0 w-8 h-8 rounded-full bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] flex items-center justify-center hover:bg-[var(--tuwa-bg-muted)] transition-colors cursor-pointer"
      >
        <ArrowsRightLeftIcon className="w-4 h-4 text-[var(--tuwa-text-primary)]" />
      </button>
    </div>
  );
}
