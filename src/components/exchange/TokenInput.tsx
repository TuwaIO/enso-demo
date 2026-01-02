'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
    <div className="bg-[var(--tuwa-bg-tertiary)] p-4 rounded-xl border border-[var(--tuwa-border-primary)] hover:border-[var(--tuwa-border-secondary)] transition-colors group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-[var(--tuwa-text-secondary)] uppercase tracking-wider pl-1">
          {label}
        </label>
        {rightLabel}
      </div>

      <div className="flex items-center gap-3">
        {/* Token Selector */}
        <button
          className="flex items-center gap-2 bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-primary)] px-2 py-1.5 rounded-full border border-[var(--tuwa-border-primary)] transition-all min-w-[110px] sm:min-w-[130px] shadow-sm cursor-pointer"
          onClick={onSelectToken}
        >
          {token ? (
            <>
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                {token.logoUri ? (
                  <img src={token.logoUri} alt={token.symbol} className="w-full h-full object-cover" />
                ) : (
                  <Web3Icon symbol={token.symbol} className="w-full h-full" />
                )}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-bold text-[var(--tuwa-text-primary)] leading-tight truncate w-full text-left">
                  {token.symbol}
                </span>
                <span className="text-[10px] text-[var(--tuwa-text-secondary)] leading-tight truncate w-full text-left">
                  {token.name}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm font-medium text-[var(--tuwa-text-primary)] pl-1">Select Token</span>
          )}
          <ChevronDownIcon className="w-4 h-4 text-[var(--tuwa-text-secondary)] ml-auto" />
        </button>

        {/* Input Field */}
        <div className="flex-1 flex flex-col items-end min-w-0">
          <input
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder="0"
            disabled={disabled}
            className="w-full bg-transparent text-right text-2xl font-bold text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          />
          {token && amount && parseFloat(amount) > 0 && (
            <div className="text-xs text-[var(--tuwa-text-secondary)] mt-1 font-medium">
              {/* Placeholder for USD calculation based on token price */}
              {token.price ? `≈ $${(parseFloat(amount) * token.price).toFixed(2)}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
