'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { SortedBalanceItem } from '@/server/api/types/enso';

interface AssetsListProps {
  assets: SortedBalanceItem[] | undefined;
  isLoading: boolean;
  error?: string;
}

export function AssetsList({ assets, isLoading, error }: AssetsListProps) {
  const router = useRouter();

  const calculateTotalBalance = () => {
    if (!assets || assets.length === 0) return 0;
    return assets.reduce((sum, t) => sum + t.usdValue, 0);
  };

  const totalBalanceUSD = calculateTotalBalance();

  const handleAssetClick = (asset: SortedBalanceItem) => {
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
        <p className="text-sm text-[var(--tuwa-text-tertiary)]">
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
          <BanknotesIcon className="w-8 h-8 text-[var(--tuwa-text-tertiary)]" />
        </div>
        <p className="text-[var(--tuwa-text-secondary)]">No assets found in this wallet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Total Balance Display */}
      <div className="flex justify-end mb-3">
        <div className="bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm text-white font-medium">Total Balance</p>
          <p className="text-xl text-white font-bold">${totalBalanceUSD.toFixed(2)}</p>
        </div>
      </div>

      {/* Assets List */}
      <div className="NovaCustomScroll space-y-2 max-h-[450px] overflow-y-auto overflow-x-hidden">
        {assets.map((asset, index: number) => (
          <motion.div
            key={asset.token || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-muted)] transition-colors cursor-pointer"
            onClick={() => handleAssetClick(asset)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] flex items-center justify-center text-white font-bold">
              <Web3Icon symbol={asset.symbol} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--tuwa-text-primary)] truncate">
                {asset.name || 'Unknown Token'}
              </h3>
              <p className="text-sm text-[var(--tuwa-text-secondary)]">{asset.symbol || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-semibold text-[var(--tuwa-text-primary)]">
                {asset.formattedBalance ? asset.formattedBalance : '0.0000'}
              </p>
              <p className="text-xs text-[var(--tuwa-text-tertiary)]">
                {asset.formattedUsdValue ? `${asset.formattedUsdValue}` : ''}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
