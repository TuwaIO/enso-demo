'use client';

import { BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { cn } from '@tuwaio/nova-core';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import { motion } from 'framer-motion';

import { api } from '@/utils/trpc';

export default function HomePage() {
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);

  // Fetch wallet balances using tRPC query (only for EVM)
  const { data: balances, isLoading } = api.enso.getWalletBalances.useQuery(
    {
      address: activeConnection?.address ?? '',
      chainId: Number(activeConnection?.chainId ?? 1),
    },
    {
      enabled:
        !!activeConnection &&
        !!activeConnection?.connectorType &&
        getAdapterFromConnectorType(activeConnection.connectorType) === OrbitAdapter.EVM,
    },
  );

  return (
    <div className="w-full flex justify-center items-center bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] gap-4 flex-wrap relative min-h-[calc(100dvh-65px)]">
      {activeConnection && getAdapterFromConnectorType(activeConnection.connectorType) === OrbitAdapter.EVM ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.1, 0.1, 0.2, 1] }}
          className="p-4 w-full max-w-2xl"
        >
          <div className="bg-[var(--tuwa-bg-primary)] rounded-2xl shadow-2xl border border-[var(--tuwa-border-primary)] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 p-2 rounded-full bg-white/20">
                  <BanknotesIcon className="w-full h-full text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Wallet Assets</h1>
                  <p className="text-blue-100 text-sm">Powered by Enso Finance</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-[var(--tuwa-bg-secondary)]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--tuwa-border-primary)]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[var(--tuwa-border-primary)] rounded w-1/4" />
                        <div className="h-3 bg-[var(--tuwa-border-primary)] rounded w-1/3" />
                      </div>
                      <div className="h-4 bg-[var(--tuwa-border-primary)] rounded w-1/5" />
                    </div>
                  ))}
                </div>
              ) : balances && balances.length > 0 ? (
                <div className="space-y-2">
                  {balances.map((asset, index: number) => (
                    <motion.div
                      key={asset.token || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-muted)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] flex items-center justify-center text-white font-bold">
                        {asset.symbol?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--tuwa-text-primary)] truncate">
                          {asset.name || 'Unknown Token'}
                        </h3>
                        <p className="text-sm text-[var(--tuwa-text-secondary)]">{asset.symbol || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-[var(--tuwa-text-primary)]">
                          {asset.amount
                            ? (Number(asset.amount) / Math.pow(10, asset.decimals || 18)).toFixed(4)
                            : '0.0000'}
                        </p>
                        <p className="text-xs text-[var(--tuwa-text-tertiary)]">
                          {asset.price
                            ? `$${(Number(asset.price) * (Number(asset.amount) / Math.pow(10, asset.decimals || 18))).toFixed(2)}`
                            : ''}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--tuwa-bg-secondary)] flex items-center justify-center">
                    <BanknotesIcon className="w-8 h-8 text-[var(--tuwa-text-tertiary)]" />
                  </div>
                  <p className="text-[var(--tuwa-text-secondary)]">No assets found in this wallet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.1, 0.1, 0.2, 1] }}
          className={cn(
            'flex flex-col items-center justify-center p-8 m-8 max-w-sm text-center',
            'rounded-xl shadow-2xl backdrop-blur-sm',
            'bg-[var(--tuwa-bg-primary)] ring-1 ring-[var(--tuwa-border-primary)]',
          )}
        >
          <div className="w-12 h-12 p-2 rounded-full mb-4 bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-[var(--tuwa-text-on-accent)]">
            <WalletIcon className="w-full h-full" />
          </div>
          <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">Wallet Required</h2>
          <p className="text-[var(--tuwa-text-secondary)]">
            Connect your EVM wallet to view your assets powered by Enso Finance.
          </p>
        </motion.div>
      )}
    </div>
  );
}
