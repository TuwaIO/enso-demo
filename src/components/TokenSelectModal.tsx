'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { CloseIcon, cn, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { useMemo, useState } from 'react';
import { Chain } from 'viem/chains';

import { DisplayToken, SortedBalanceItem } from '@/server/api/types/enso';
import { getTokenPriority } from '@/server/api/utils/priorityTokens';
import { api } from '@/utils/trpc';

import { NetworkSelector } from './NetworkSelector';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: SortedBalanceItem[];
  onSelectToken: (token: SortedBalanceItem) => void;
  selectedTokenAddress?: string;
  chainId: number;
  filterByBalance?: boolean;
  enableChainSelection?: boolean;
  chains?: readonly Chain[];
  onSelectChain?: (chainId: number) => void;
  disabledTokenAddresses?: string[];
}

export function TokenSelectModal({
  isOpen,
  onClose,
  tokens,
  onSelectToken,
  selectedTokenAddress,
  chainId,
  filterByBalance = false,
  enableChainSelection = false,
  chains = [],
  onSelectChain,
  disabledTokenAddresses = [],
}: TokenSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tokens from API
  const { data: apiTokens, isLoading: isLoadingTokens } = api.enso.getTokensList.useQuery(
    { chainId },
    { enabled: isOpen, refetchOnWindowFocus: false },
  );

  // Memoized display tokens to avoid re-computation
  const displayTokens = useMemo<DisplayToken[]>(() => {
    // Create a map of wallet tokens by address for quick lookup
    const walletTokensMap = new Map<string, SortedBalanceItem>();
    tokens.forEach((token) => {
      walletTokensMap.set(token.token.toLowerCase(), token);
    });

    // Filter wallet tokens by chainId - only include tokens from the selected chain
    const filteredWalletTokens = tokens.filter((walletToken) => walletToken.chainId === chainId);

    // Start with wallet tokens that match the selected chainId
    const walletTokensAsDisplay: DisplayToken[] = filteredWalletTokens.map((walletToken) => ({
      address: walletToken.token,
      chainId: walletToken.chainId,
      decimals: walletToken.decimals,
      symbol: walletToken.symbol,
      name: walletToken.name,
      logoURI: walletToken.logoUri || '',
      balance: walletToken.formattedBalance.toFixed(4),
      usdValue: walletToken.price > 0 ? walletToken.formattedUsdValue : 'Price N/A',
      hasBalance: true,
    }));

    // Add API tokens that are NOT already in wallet (check against ALL wallet tokens, not just filtered)
    const apiTokensAsDisplay: DisplayToken[] = (apiTokens || [])
      .filter((apiToken) => !walletTokensMap.has(apiToken.address.toLowerCase()))
      .map((apiToken) => ({
        address: apiToken.address,
        chainId: apiToken.chainId,
        decimals: apiToken.decimals,
        symbol: apiToken.symbol,
        name: apiToken.name,
        logoURI: apiToken.logosUri?.length ? apiToken.logosUri[0] : '',
        balance: '0.0000',
        usdValue: '$0.00',
        hasBalance: false,
      }));

    // Combine all tokens
    const allTokens = [...walletTokensAsDisplay, ...apiTokensAsDisplay];

    console.log(
      `🚀 Final token counts: wallet=${walletTokensAsDisplay.length}, api=${apiTokensAsDisplay.length}, total=${allTokens.length}`,
    );

    // Enhanced sorting: balance first, then priority, then alphabetical
    return allTokens.sort((a, b) => {
      // First: tokens with balance come first
      if (a.hasBalance !== b.hasBalance) {
        return b.hasBalance ? 1 : -1;
      }

      // Second: if both have balance OR both don't have balance, sort by priority
      const priorityA = getTokenPriority(a.symbol);
      const priorityB = getTokenPriority(b.symbol);

      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Lower priority number = higher priority
      }

      // Third: if same priority, sort alphabetically
      return a.symbol.localeCompare(b.symbol);
    });
  }, [apiTokens, tokens, chainId]);

  // Filter tokens based on search term and balance filter
  const filteredTokens = useMemo(() => {
    let result = displayTokens;

    if (filterByBalance) {
      result = result.filter((t) => t.hasBalance);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (token) =>
          token.symbol.toLowerCase().includes(term) ||
          token.name.toLowerCase().includes(term) ||
          token.address.toLowerCase().includes(term),
      );
    }

    return result;
  }, [searchTerm, displayTokens, filterByBalance]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-[var(--tuwa-bg-primary)] rounded-xl p-0">
        {/* Header */}
        <DialogHeader className="flex items-center justify-between p-4 border-b border-[var(--tuwa-border-primary)] shrink-0">
          <DialogTitle className="text-lg font-bold text-[var(--tuwa-text-primary)]">Select Token</DialogTitle>
          <DialogClose asChild>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--tuwa-bg-secondary)] cursor-pointer text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors">
              <CloseIcon className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Chain Selection (Optional) */}
        {enableChainSelection && chains.length > 0 && onSelectChain && (
          <div className="p-4 pb-0">
            <div className="mb-2 text-xs font-medium text-[var(--tuwa-text-secondary)]">Network</div>
            <NetworkSelector chains={chains} selectedChainId={chainId} onSelectChain={onSelectChain} />
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-[var(--tuwa-border-primary)] shrink-0">
          <input
            type="text"
            placeholder="Search by name or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-button-gradient-from)]"
          />
        </div>

        {/* Token List */}
        <div className="overflow-y-auto max-h-[400px] NovaCustomScroll">
          {isLoadingTokens ? (
            <div className="text-center py-8 text-[var(--tuwa-text-secondary)] animate-pulse">Loading tokens...</div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-[var(--tuwa-text-secondary)]">
              {filterByBalance ? 'No tokens with balance found' : 'No tokens found'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTokens.map((token) => (
                <button
                  key={`${token.chainId}-${token.address}`}
                  onClick={() => {
                    onSelectToken(convertToSortedBalanceItem(token));
                    onClose();
                  }}
                  disabled={disabledTokenAddresses.some((addr) => addr.toLowerCase() === token.address.toLowerCase())}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors group',
                    token.address.toLowerCase() === selectedTokenAddress?.toLowerCase() &&
                      'bg-[var(--tuwa-bg-secondary)]',
                    disabledTokenAddresses.some((addr) => addr.toLowerCase() === token.address.toLowerCase())
                      ? 'opacity-50 cursor-not-allowed bg-[var(--tuwa-bg-muted)]'
                      : 'hover:bg-[var(--tuwa-bg-secondary)] cursor-pointer',
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--tuwa-bg-secondary)] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {token.logoURI ? (
                      <img src={token.logoURI} alt={token.symbol} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Web3Icon symbol={token.symbol} className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--tuwa-text-primary)] truncate">{token.symbol}</span>
                      {token.hasBalance && (
                        <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full font-medium border border-green-500/20">
                          Balance
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--tuwa-text-secondary)] truncate">{token.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        'font-mono text-sm',
                        token.hasBalance
                          ? 'text-[var(--tuwa-text-primary)] font-semibold'
                          : 'text-[var(--tuwa-text-secondary)]',
                      )}
                    >
                      {parseFloat(token.balance) > 0
                        ? parseFloat(token.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })
                        : '0'}
                    </div>
                    <div
                      className={cn(
                        'text-xs',
                        token.hasBalance ? 'text-[var(--tuwa-text-secondary)]' : 'text-[var(--tuwa-text-secondary)]',
                      )}
                    >
                      {token.usdValue}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
