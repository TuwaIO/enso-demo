'use client';

import { ArrowDownIcon } from '@heroicons/react/24/outline';

interface SwapButtonProps {
  onSwap: () => void;
}

export function SwapButton({ onSwap }: SwapButtonProps) {
  return (
    <div className="flex justify-center my-2">
      <button
        onClick={onSwap}
        className="w-10 h-10 rounded-full bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] flex items-center justify-center hover:bg-[var(--tuwa-bg-muted)] transition-colors"
      >
        <ArrowDownIcon className="w-5 h-5 text-[var(--tuwa-text-primary)]" />
      </button>
    </div>
  );
}
