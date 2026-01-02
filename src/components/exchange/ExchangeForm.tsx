'use client';

import { Hop, SortedBalanceItem } from '@/server/api/types/enso';

import { ExchangeButton } from './ExchangeButton';
import { ExchangeRate } from './ExchangeRate';
import { RecipientInput } from './RecipientInput';
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
}: ExchangeFormProps) {
  // Determine if exchange button should be disabled
  const isExchangeDisabled = !fromToken || !toToken || !fromAmount || !toAmount || (parseFloat(fromAmount) === 0);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
         {/* Optional: Add Refresh Timer in header-like position or next to settings? 
             Actually user asked for "indicator (loader) ... so we must add it".
             Let's put it on top right or near ExchangeRate.
         */}
      </div>
      
      {/* From Token */}
      <TokenInput
        label="Sell"
        token={fromToken}
        amount={fromAmount}
        onAmountChange={onFromAmountChange}
        onSelectToken={onSelectFromToken}
        rightLabel={
          fromToken && (
            <div className="flex items-center gap-2">
               <span className="text-xs text-[var(--tuwa-text-secondary)]">Balance: {fromToken.formattedBalance.toFixed(4)}</span>
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
                <span className="text-xs text-[var(--tuwa-text-secondary)]">Balance: {toToken.formattedBalance.toFixed(4)}</span>
            )
        }
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

      {/* Slippage Settings */}
      <SlippageSettings slippage={slippage} onSlippageChange={onSlippageChange} />

      {/* Recipient Input */}
      <RecipientInput recipientAddress={recipientAddress} onRecipientChange={onRecipientChange} />

      {/* Spacer */}
      <div className="h-4"></div>

      {/* Exchange Button */}
      <ExchangeButton onExchange={onExchange} disabled={isExchangeDisabled} walletConnected={walletConnected} />
    </div>
  );
}
