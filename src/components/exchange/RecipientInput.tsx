'use client';

import { PaperAirplaneIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface RecipientInputProps {
  recipientAddress: string;
  onRecipientChange: (address: string) => void;
}

export function RecipientInput({ recipientAddress, onRecipientChange }: RecipientInputProps) {
  const [isExpanded, setIsExpanded] = useState(!!recipientAddress);

  const toggleExpanded = () => {
    if (isExpanded) {
      // If collapsing, clear the address
      onRecipientChange('');
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="mt-2">
      {!isExpanded ? (
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 text-xs font-medium text-[var(--tuwa-button-gradient-from)] hover:text-[var(--tuwa-button-gradient-to)] transition-colors cursor-pointer"
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5" />
          <span>Send to a different wallet</span>
        </button>
      ) : (
        <div className="bg-[var(--tuwa-bg-secondary)] rounded-lg p-3 border border-[var(--tuwa-border-primary)] animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-[var(--tuwa-text-primary)]">Recipient Address</span>
            <button
              onClick={toggleExpanded}
              className="text-xs text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => onRecipientChange(e.target.value)}
              placeholder="0x..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--tuwa-bg-muted)] border border-[var(--tuwa-border-primary)] rounded-md text-[var(--tuwa-text-primary)] focus:outline-none focus:border-[var(--tuwa-button-gradient-from)] font-mono"
            />
            <WalletIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tuwa-text-secondary)]" />
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--tuwa-text-secondary)]">
            Tokens will be sent to this address after the swap.
          </p>
        </div>
      )}
    </div>
  );
}
