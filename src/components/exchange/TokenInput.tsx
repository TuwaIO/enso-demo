'use client';

import React from 'react';

import { SortedBalanceItem } from '@/server/api/types/enso';

interface TokenInputProps {
  label: string;
  token: SortedBalanceItem | null;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectToken: () => void;
  rightLabel?: React.ReactNode;
  disabled?: boolean;
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
  rightLabel,
  disabled = false,
}: TokenInputProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-[var(--tuwa-text-secondary)]">{label}</label>
        {rightLabel}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={onAmountChange}
          placeholder="0.0"
          disabled={disabled}
          className="flex-1 p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-button-gradient-from)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          className="min-w-[120px] p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] flex items-center justify-center gap-2 cursor-pointer"
          onClick={onSelectToken}
        >
          {token ? token.symbol : 'Select Token'}
        </button>
      </div>
    </div>
  );
}
