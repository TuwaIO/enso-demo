'use client';

import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

import { ExchangeFormProps } from '@/types/exchange';

import { ExchangeButton } from './ExchangeButton';
import { ExchangeDetails } from './ExchangeDetails';
import { ExchangeRate } from './ExchangeRate';
import { RefreshTimer } from './RefreshTimer';
import { RouteDetails } from './RouteDetails';
import { SlippageSettings } from './SlippageSettings';
import { SwapButton } from './SwapButton';
import { TokenInput } from './TokenInput';

export function ExchangeForm({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  slippage,
  isLoadingRoute,
  isErrorRoute,
  walletConnected,
  route,
  gas,
  gasPrice,
  nativeCurrency,
  minAmountOut,
  priceImpact,
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
  needsApproval = false,
  isApproving = false,
  onApprove,
}: ExchangeFormProps) {
  // Determine if exchange button should be disabled
  const isExchangeDisabled =
    !fromToken ||
    !toToken ||
    !fromAmount ||
    !toAmount ||
    parseFloat(fromAmount) === 0 ||
    isErrorRoute ||
    (needsApproval && isApproving);

  const handleExecute = () => {
    onExchange();
  };

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
        onMaxAmount={onMaxAmount}
        chains={chains}
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
        walletAddress={recipientAddress || currentWalletAddress}
        onWalletAddressChange={onRecipientChange}
        showNetworkInfo={true}
        chains={chains}
        onMaxAmount={onMaxAmount}
        isLoadingRoute={isLoadingRoute}
      />

      {/* 🚨 Error Block - Beautiful TUWA Style */}
      {isErrorRoute && (
        <div className="mt-4 p-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40 shadow-sm">
          <div className="flex items-start gap-3">
            {/* Error Icon */}
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
            </div>

            {/* Error Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Route Not Available</h3>
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                No trading route found for this token pair. This could happen due to:
              </p>
              <ul className="mt-2 text-sm text-red-600 dark:text-red-400 space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500"></div>
                  Insufficient liquidity on selected networks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500"></div>
                  Invalid amount or token pair
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500"></div>
                  Cross-chain bridge temporarily unavailable
                </li>
              </ul>
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">
                💡 Try selecting different tokens or adjusting the amount
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Rate & Refresh */}
      {fromToken && toToken && Number(fromAmount) > 0 && Number(toAmount) > 0 && !isErrorRoute && (
        <>
          <div className="relative flex items-center justify-between mt-2 bg-[var(--tuwa-bg-secondary)] p-3 rounded-lg border border-[var(--tuwa-border-primary)] border-dashed">
            <div className="absolute top-[-17px] right-[-15px]">
              <RefreshTimer onRefresh={onRefresh} isLoading={isLoadingRoute} />
            </div>
            <ExchangeRate
              fromSymbol={fromToken.symbol}
              toSymbol={toToken.symbol}
              fromAmount={fromAmount}
              toAmount={toAmount}
              isLoading={isLoadingRoute}
              gas={gas}
              gasPrice={gasPrice}
              nativeCurrency={nativeCurrency}
            />
          </div>

          <ExchangeDetails
            minAmountOut={minAmountOut}
            priceImpact={priceImpact}
            fromSymbol={fromToken.symbol}
            toSymbol={toToken.symbol}
          />

          <RouteDetails route={route} />
        </>
      )}

      <div className="h-8"></div>

      <div className="flex gap-2 w-full">
        {/* Approve Button */}
        {needsApproval && (
          <div className="flex-1">
            <ExchangeButton
              onExchange={onApprove || (() => {})}
              disabled={isApproving}
              walletConnected={walletConnected}
              label={`Approve ${fromToken?.symbol}`}
              isLoading={isApproving}
              variant="secondary"
            />
          </div>
        )}

        {/* Execute Button */}
        <div className={needsApproval ? 'flex-1' : 'w-full'}>
          <ExchangeButton
            onExchange={handleExecute}
            disabled={isExchangeDisabled || needsApproval} // Block execution if approval needed
            walletConnected={walletConnected}
            label={isLoadingRoute ? 'Finding Route...' : 'Execute'}
            isLoading={isLoadingRoute}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
