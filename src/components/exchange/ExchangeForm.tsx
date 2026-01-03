'use client';

import { Chain } from 'viem/chains';

import { Hop, SortedBalanceItem } from '@/server/api/types/enso';

import { ExchangeButton } from './ExchangeButton';
import { ExchangeRate } from './ExchangeRate';
import { RefreshTimer } from './RefreshTimer';
import { SlippageSettings } from './SlippageSettings';
import { SwapButton } from './SwapButton';
import { TokenInput } from './TokenInput';

interface ExchangeFormProps {
  fromToken: SortedBalanceItem | null;
  toToken: SortedBalanceItem | null;
  fromAmount: string;
  toAmount: string;
  slippage: string;
  isLoadingRoute: boolean;
  walletConnected: boolean;
  route?: Hop[];
  onFromAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlippageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectFromToken: () => void;
  onSelectToToken: () => void;
  onSwapTokens: () => void;
  onMaxAmount: () => void;
  onExchange: () => void;
  recipientAddress: string;
  onRecipientChange: (address: string) => void;
  onRefresh: () => void;
  chains?: readonly Chain[];
  currentWalletAddress?: string;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export function ExchangeForm({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  slippage,
  isLoadingRoute,
  walletConnected,
  route,
  onFromAmountChange,
  onToAmountChange,
  onSlippageChange,
  onSelectFromToken,
  onSelectToToken,
  onSwapTokens,
  onMaxAmount,
  onExchange,
  recipientAddress,
  onRecipientChange,
  onRefresh,
  chains,
  currentWalletAddress,
  errorMessage,
  successMessage,
}: ExchangeFormProps) {
  // Determine if exchange button should be disabled
  const isExchangeDisabled = !fromToken || !toToken || !fromAmount || !toAmount || parseFloat(fromAmount) === 0;

  return (
    <div className="p-4">
      {/* Slippage Settings */}
      <SlippageSettings slippage={slippage} onSlippageChange={onSlippageChange} />

      {/* From Token */}
      <TokenInput
        label="Sell"
        token={fromToken}
        amount={fromAmount}
        onAmountChange={onFromAmountChange}
        onSelectToken={onSelectFromToken}
        walletAddress={currentWalletAddress}
        rightLabel={
          fromToken && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--tuwa-text-secondary)]">
                Balance: {fromToken.formattedBalance.toFixed(4)}
              </span>
              <button
                onClick={onMaxAmount}
                className="text-xs text-[var(--tuwa-button-gradient-from)] hover:text-[var(--tuwa-button-gradient-to)] font-medium uppercase tracking-wide cursor-pointer"
              >
                Max
              </button>
            </div>
          )
        }
      />

      {/* Swap Button */}
      <SwapButton onSwap={onSwapTokens} />

      {/* To Token */}
      <TokenInput
        label="Buy"
        token={toToken}
        amount={toAmount}
        onAmountChange={onToAmountChange}
        onSelectToken={onSelectToToken}
        rightLabel={
          toToken && (
            <span className="text-xs text-[var(--tuwa-text-secondary)]">
              Balance: {toToken.formattedBalance.toFixed(4)}
            </span>
          )
        }
        walletAddress={recipientAddress || currentWalletAddress}
        onWalletAddressChange={onRecipientChange}
        showNetworkInfo={true}
        chains={chains}
      />

      {/* Exchange Rate & Refresh */}
      {fromToken && toToken && (
        <div className="flex items-center justify-between mt-2 mb-4 bg-[var(--tuwa-bg-secondary)] p-2 rounded-lg border border-[var(--tuwa-border-primary)] border-dashed">
          <ExchangeRate
            fromSymbol={fromToken.symbol}
            toSymbol={toToken.symbol}
            fromAmount={fromAmount}
            toAmount={toAmount}
            isLoading={isLoadingRoute}
            route={route}
          />
          <RefreshTimer onRefresh={onRefresh} isLoading={isLoadingRoute} />
        </div>
      )}

      {/* Recipient Input - Removed as functionality is now in TokenInput */}

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Spacer */}
      <div className="h-4"></div>

      {/* Exchange Button */}
      <ExchangeButton onExchange={onExchange} disabled={isExchangeDisabled} walletConnected={walletConnected} />
    </div>
  );
}
