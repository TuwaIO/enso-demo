'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

import { DisplayToken, SortedBalanceItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: SortedBalanceItem[];
  onSelectToken: (token: SortedBalanceItem) => void;
  selectedTokenAddress?: string;
  chainId: number;
}

export function TokenSelectModal({
  isOpen,
  onClose,
  tokens,
  onSelectToken,
  selectedTokenAddress,
  chainId,
}: TokenSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tokens from API
  const { data: apiTokens, isLoading: isLoadingTokens } = api.enso.getTokensList.useQuery(
    { chainId },
    { enabled: isOpen, refetchOnWindowFocus: false },
  );

  // Memoized display tokens to avoid re-computation
  const displayTokens = useMemo<DisplayToken[]>(() => {
    if (!apiTokens) return [];

    // Create a map of wallet tokens by address for quick lookup
    const walletTokensMap = new Map<string, SortedBalanceItem>();
    tokens.forEach((token) => {
      walletTokensMap.set(token.token.toLowerCase(), token);
    });

    // Convert API tokens to display format, merging with wallet tokens if they exist
    const allTokens: DisplayToken[] = apiTokens.map((apiToken) => {
      const walletToken = walletTokensMap.get(apiToken.address.toLowerCase());
      const hasBalance = !!walletToken && walletToken.formattedBalance > 0;

      return {
        address: apiToken.address,
        chainId: apiToken.chainId,
        decimals: apiToken.decimals,
        symbol: apiToken.symbol,
        name: apiToken.name,
        logoURI: apiToken.logosUri?.length ? apiToken.logosUri[0] : '',
        balance: hasBalance ? walletToken.formattedBalance.toFixed(4) : '0.0000',
        usdValue: hasBalance ? walletToken.formattedUsdValue : '$0.00',
        hasBalance,
      };
    });

    // Sort tokens: wallet tokens with balance first, then by symbol
    return allTokens.sort((a, b) => {
      if (a.hasBalance !== b.hasBalance) {
        return b.hasBalance ? 1 : -1; // Tokens with balance first
      }
      return a.symbol.localeCompare(b.symbol); // Then alphabetically
    });
  }, [apiTokens, tokens]);

  // Filter tokens based on search term
  const filteredTokens = useMemo(() => {
    if (!searchTerm) {
      return displayTokens;
    }

    const term = searchTerm.toLowerCase();
    return displayTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(term) ||
        token.name.toLowerCase().includes(term) ||
        token.address.toLowerCase().includes(term),
    );
  }, [searchTerm, displayTokens]);

  // Helper function to convert DisplayToken back to SortedBalanceItem
  const convertToSortedBalanceItem = (displayToken: DisplayToken): SortedBalanceItem => {
    // Find the original token in the wallet tokens if it exists
    const walletToken = tokens.find((t) => t.token.toLowerCase() === displayToken.address.toLowerCase());

    if (walletToken) {
      return walletToken;
    }

    // If not in wallet, create a new SortedBalanceItem with default values
    return {
      token: displayToken.address,
      amount: '0',
      chainId: displayToken.chainId,
      decimals: displayToken.decimals,
      price: 0,
      name: displayToken.name,
      symbol: displayToken.symbol,
      logoUri: displayToken.logoURI || null,
      formattedBalance: 0,
      usdValue: 0,
      formattedUsdValue: '$0.00',
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-[var(--tuwa-bg-primary)] rounded-xl shadow-2xl border border-[var(--tuwa-border-primary)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--tuwa-border-primary)]">
          <h2 className="text-lg font-bold text-[var(--tuwa-text-primary)]">Select Token</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--tuwa-bg-secondary)] cursor-pointer"
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
          {isLoadingTokens ? (
            <div className="text-center py-4 text-[var(--tuwa-text-secondary)] animate-pulse">Loading tokens...</div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-4 text-[var(--tuwa-text-secondary)]">No tokens found</div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onSelectToken(convertToSortedBalanceItem(token));
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--tuwa-bg-secondary)] transition-colors cursor-pointer ${
                  token.address.toLowerCase() === selectedTokenAddress?.toLowerCase()
                    ? 'bg-[var(--tuwa-bg-secondary)]'
                    : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] flex items-center justify-center text-white">
                  <Web3Icon symbol={token.symbol} className="w-full h-full" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-[var(--tuwa-text-primary)]">
                    {token.symbol}
                    {token.hasBalance && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        In Wallet
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--tuwa-text-secondary)] truncate">{token.name}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono text-sm ${
                      token.hasBalance
                        ? 'text-[var(--tuwa-text-primary)] font-semibold'
                        : 'text-[var(--tuwa-text-tertiary)]'
                    }`}
                  >
                    {token.balance}
                  </div>
                  <div
                    className={`text-xs ${
                      token.hasBalance ? 'text-[var(--tuwa-text-secondary)]' : 'text-[var(--tuwa-text-tertiary)]'
                    }`}
                  >
                    {token.usdValue}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
