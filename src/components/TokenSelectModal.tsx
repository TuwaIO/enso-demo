'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

import { SortedBalanceItem } from '@/server/api/routers/enso';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: SortedBalanceItem[];
  onSelectToken: (token: SortedBalanceItem) => void;
  selectedTokenAddress?: string;
}

export function TokenSelectModal({
  isOpen,
  onClose,
  tokens,
  onSelectToken,
  selectedTokenAddress,
}: TokenSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<SortedBalanceItem[]>(tokens);

  // Filter tokens based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTokens(tokens);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(term) ||
        token.name.toLowerCase().includes(term) ||
        token.token.toLowerCase().includes(term)
    );
    setFilteredTokens(filtered);
  }, [searchTerm, tokens]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-[var(--tuwa-bg-primary)] rounded-xl shadow-2xl border border-[var(--tuwa-border-primary)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--tuwa-border-primary)]">
          <h2 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Select Token</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--tuwa-bg-secondary)]"
          >
            <XMarkIcon className="w-5 h-5 text-[var(--tuwa-text-primary)]" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--tuwa-border-primary)]">
          <input
            type="text"
            placeholder="Search by name or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-button-gradient-from)]"
          />
        </div>

        {/* Token List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-4 text-[var(--tuwa-text-secondary)]">No tokens found</div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.token}
                onClick={() => {
                  onSelectToken(token);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--tuwa-bg-secondary)] transition-colors ${
                  token.token === selectedTokenAddress ? 'bg-[var(--tuwa-bg-secondary)]' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] flex items-center justify-center text-white">
                  <Web3Icon symbol={token.symbol} className="w-full h-full" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-[var(--tuwa-text-primary)]">{token.symbol}</div>
                  <div className="text-xs text-[var(--tuwa-text-secondary)]">{token.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-[var(--tuwa-text-primary)]">
                    {token.formattedBalance.toFixed(4)}
                  </div>
                  <div className="text-xs text-[var(--tuwa-text-tertiary)]">{token.formattedUsdValue}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}