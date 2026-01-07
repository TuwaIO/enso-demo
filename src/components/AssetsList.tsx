'use client';

import { ArrowsRightLeftIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { TokenWithNetworkBadge } from '@/components/TokenWithNetworkBadge';
import { SortedBalanceItem } from '@/server/api/types/enso';

interface AssetsListProps {
  assets: SortedBalanceItem[] | undefined;
  isLoading: boolean;
  error?: string;
}

export function AssetsList({ assets, isLoading, error }: AssetsListProps) {
  const router = useRouter();

  const handleSwapClick = (asset: SortedBalanceItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/exchange?from=${asset.token}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-[var(--tuwa-bg-secondary)]">
            <div className="w-10 h-10 rounded-full bg-[var(--tuwa-border-primary)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--tuwa-border-primary)] rounded w-1/4" />
              <div className="h-3 bg-[var(--tuwa-border-primary)] rounded w-1/3" />
            </div>
            <div className="h-4 bg-[var(--tuwa-border-primary)] rounded w-1/5" />
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-[var(--tuwa-text-primary)] mb-2">Error Loading Assets</h3>
        <p className="text-[var(--tuwa-text-secondary)] mb-2">{error}</p>
        <p className="text-sm text-[var(--tuwa-text-secondary)]">
          Please try again or check the wallet address and network.
        </p>
      </div>
    );
  }

  // Show empty state
  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--tuwa-bg-secondary)] flex items-center justify-center">
          <BanknotesIcon className="w-8 h-8 text-[var(--tuwa-text-secondary)]" />
        </div>
        <p className="text-[var(--tuwa-text-secondary)]">No assets found in this wallet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Assets List */}
      <div className="NovaCustomScroll space-y-2 max-h-[450px] overflow-y-auto overflow-x-hidden">
        {assets.map((asset, index: number) => (
          <motion.div
            key={asset.token || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-muted)] transition-all duration-200 border border-transparent hover:border-[var(--tuwa-border-primary)] relative">
              {/* Token Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] flex items-center justify-center text-white font-bold shadow-sm">
                <TokenWithNetworkBadge token={asset} size="md" showNetworkBadge={false} />
              </div>

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--tuwa-text-primary)] truncate">
                  {asset.name || 'Unknown Token'}
                </h3>
                <p className="text-sm text-[var(--tuwa-text-secondary)]">{asset.symbol || 'N/A'}</p>
              </div>

              <div className="text-right min-w-0 flex-shrink-0 sm:group-hover:transform sm:group-hover:-translate-x-10 transition-transform duration-200">
                <p className="font-mono font-semibold text-[var(--tuwa-text-primary)] text-sm">
                  {asset.formattedBalance ? asset.formattedBalance.toFixed(4) : '0.0000'}
                </p>
                <p className="text-xs text-[var(--tuwa-text-secondary)]">
                  {asset.formattedUsdValue ? `${asset.formattedUsdValue}` : ''}
                </p>
              </div>

              <div className="sm:absolute sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => handleSwapClick(asset, e)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)]/10 to-[var(--tuwa-button-gradient-to)]/10 hover:from-[var(--tuwa-button-gradient-from)]/20 hover:to-[var(--tuwa-button-gradient-to)]/20 border border-[var(--tuwa-button-gradient-from)]/20 hover:border-[var(--tuwa-button-gradient-from)]/30 text-[var(--tuwa-button-gradient-from)] transition-all duration-150 active:scale-90 cursor-pointer"
                  title="Swap"
                >
                  <ArrowsRightLeftIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
