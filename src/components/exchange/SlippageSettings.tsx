'use client';

import { CogIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface SlippageSettingsProps {
  slippage: string;
  onSlippageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SlippageSettings({ slippage, onSlippageChange }: SlippageSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm font-medium text-[var(--tuwa-text-secondary)] flex items-center gap-1"
        >
          <CogIcon className="w-4 h-4" />
          Slippage Tolerance
        </button>
        <span className="text-sm text-[var(--tuwa-text-primary)]">{slippage}%</span>
      </div>

      {showSettings && (
        <div className="p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)]">
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippage}
            onChange={onSlippageChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[var(--tuwa-text-tertiary)]">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>
      )}
    </div>
  );
}
