import { getChainName } from '@bgd-labs/react-web3-icons/dist/utils';
import { ArrowTopRightOnSquareIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { selectAdapterByKey } from '@tuwaio/orbit-core';

import { TokenWithNetworkBadge } from '@/components/TokenWithNetworkBadge';
import { usePulsarStore } from '@/hooks/pulsarStoreHook';
import { SortedBalanceItem } from '@/server/api/types/enso';
import { SwapUsingENSOAPITX } from '@/transactions';

interface ExchangeSuccessProps {
  fromToken: SortedBalanceItem;
  toToken: SortedBalanceItem;
  tx: SwapUsingENSOAPITX;
  onClose: () => void;
}

export function ExchangeSuccess({ fromToken, toToken, tx, onClose }: ExchangeSuccessProps) {
  const isCrossChain = tx.payload.chainIdFrom !== tx.payload.chainIdTo;
  const fromChainName = getChainName(tx.payload.chainIdFrom) || 'Unknown Chain';
  const toChainName = getChainName(tx.payload.chainIdTo) || 'Unknown Chain';

  const getAdapter = usePulsarStore((state) => state.getAdapter);
  const foundAdapter = selectAdapterByKey({ adapterKey: tx.adapter, adapter: getAdapter() });
  const explorerLink = foundAdapter?.getExplorerTxUrl?.(tx);

  return (
    <div className="p-6 space-y-4">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Success Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[var(--tuwa-text-primary)]">
          {isCrossChain ? 'Cross-chain Swap Initiated!' : 'Swap Successful!'}
        </h2>
        <p className="text-sm text-[var(--tuwa-text-secondary)]">
          {isCrossChain
            ? 'Your cross-chain swap has been initiated. Please wait a few moments for the transaction to complete.'
            : 'Your tokens have been successfully exchanged.'}
        </p>
      </div>

      {/* Swap Details */}
      <div className="bg-[var(--tuwa-bg-secondary)] rounded-xl p-4 space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--tuwa-text-secondary)] uppercase tracking-wider font-semibold">From</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <TokenWithNetworkBadge token={fromToken} size="md" showNetworkBadge={isCrossChain} />
              </div>
              <div>
                <div className="font-semibold text-[var(--tuwa-text-primary)]">{fromToken.symbol}</div>
                {isCrossChain && <div className="text-xs text-[var(--tuwa-text-secondary)]">{fromChainName}</div>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[var(--tuwa-text-primary)] font-mono">
                {parseFloat(tx.payload.fromAmount).toFixed(6)}
              </div>
              {fromToken.price > 0 && (
                <div className="text-xs text-[var(--tuwa-text-secondary)]">
                  ${(parseFloat(tx.payload.fromAmount) * fromToken.price).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-[var(--tuwa-bg-primary)] flex items-center justify-center border border-[var(--tuwa-border-primary)]">
            <ArrowDownIcon className="w-5 h-5 text-[var(--tuwa-text-secondary)]" />
          </div>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--tuwa-text-secondary)] uppercase tracking-wider font-semibold">To</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <TokenWithNetworkBadge token={toToken} size="md" showNetworkBadge={isCrossChain} />
              </div>
              <div>
                <div className="font-semibold text-[var(--tuwa-text-primary)]">{toToken.symbol}</div>
                {isCrossChain && <div className="text-xs text-[var(--tuwa-text-secondary)]">{toChainName}</div>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-500 font-mono">+{parseFloat(tx.payload.toAmount).toFixed(6)}</div>
              {toToken.price > 0 && (
                <div className="text-xs text-[var(--tuwa-text-secondary)]">
                  ${(parseFloat(tx.payload.toAmount) * toToken.price).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cross-chain Warning */}
      {isCrossChain && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <ClockIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-yellow-600 dark:text-yellow-500 text-sm">
                Cross-chain transfer in progress
              </div>
              <div className="text-xs text-[var(--tuwa-text-secondary)] leading-relaxed">
                Your tokens are being bridged from <span className="font-medium">{fromChainName}</span> to{' '}
                <span className="font-medium">{toChainName}</span>. This may take a few minutes. Don&apos;t worry, your
                funds are safe!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Link */}
      {explorerLink && (
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-muted)] transition-colors border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] text-sm font-medium group"
        >
          View Transaction
          <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="cursor-pointer w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] hover:shadow-lg transition-all text-white font-semibold"
      >
        Make Another Swap
      </button>
    </div>
  );
}
