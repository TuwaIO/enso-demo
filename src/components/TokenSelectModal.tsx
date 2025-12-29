'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

import { SortedBalanceItem, TokenItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

// Type for displaying tokens in the modal
type DisplayToken = {
  address: string;
  symbol: string;
  name: string;
  logoUri?: string | null;
  balance?: string;
  usdValue?: string;
};

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
  const [displayTokens, setDisplayTokens] = useState<DisplayToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<DisplayToken[]>([]);

  // Fetch tokens from API
  const { data: apiTokens, isLoading: isLoadingTokens } = api.enso.getTokensList.useQuery(
    { chainId },
    { enabled: isOpen, refetchOnWindowFocus: false }
  );

  // Convert wallet tokens to display format
  useEffect(() => {
    if (!tokens) return;

    const walletTokensFormatted: DisplayToken[] = tokens.map(token => ({
      address: token.token,
      symbol: token.symbol,
      name: token.name,
      logoUri: token.logoUri,
      balance: token.formattedBalance.toFixed(4),
      usdValue: token.formattedUsdValue
    }));

    setDisplayTokens(walletTokensFormatted);
  }, [tokens]);

  // Merge API tokens with wallet tokens when API data is loaded
  useEffect(() => {
    if (!apiTokens) return;

    // Create a map of wallet tokens by address for quick lookup
    const walletTokensMap = new Map<string, DisplayToken>();
    displayTokens.forEach(token => {
      walletTokensMap.set(token.address.toLowerCase(), token);
    });

    // Convert API tokens to display format, merging with wallet tokens if they exist
    const allTokens: DisplayToken[] = apiTokens.map(token => {
      const walletToken = walletTokensMap.get(token.address.toLowerCase());

      return {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        logoUri: token.logoURI,
        balance: walletToken?.balance || '0',
        usdValue: walletToken?.usdValue || '$0.00'
      };
    });

    setDisplayTokens(allTokens);
  }, [apiTokens, displayTokens]);

  // Filter tokens based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTokens(displayTokens);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = displayTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(term) ||
        token.name.toLowerCase().includes(term) ||
        token.address.toLowerCase().includes(term),
    );
    setFilteredTokens(filtered);
  }, [searchTerm, displayTokens]);

  if (!isOpen) return null;

  // Helper function to convert DisplayToken back to SortedBalanceItem
  const convertToSortedBalanceItem = (displayToken: DisplayToken): SortedBalanceItem => {
    // Find the original token in the wallet tokens if it exists
    const walletToken = tokens.find(t => t.token.toLowerCase() === displayToken.address.toLowerCase());

    if (walletToken) {
      return walletToken;
    }

    // If not in wallet, create a new SortedBalanceItem with default values
    return {
      token: displayToken.address,
      amount: '0',
      chainId,
      decimals: 18, // Default to 18 decimals
      price: 0,
      name: displayToken.name,
      symbol: displayToken.symbol,
      logoUri: displayToken.logoUri,
      formattedBalance: 0,
      usdValue: 0,
      formattedUsdValue: '$0.00'
    };
  };

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
                  token.address.toLowerCase() === selectedTokenAddress?.toLowerCase() ? 'bg-[var(--tuwa-bg-secondary)]' : ''
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
                    {token.balance}
                  </div>
                  <div className="text-xs text-[var(--tuwa-text-tertiary)]">{token.usdValue}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
