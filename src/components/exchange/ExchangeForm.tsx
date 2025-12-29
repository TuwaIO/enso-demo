'use client';

import { SortedBalanceItem } from '@/server/api/types/enso';

import { ExchangeButton } from './ExchangeButton';
import { ExchangeRate } from './ExchangeRate';
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
  route?: { name: string }[];
  onFromAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlippageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectFromToken: () => void;
  onSelectToToken: () => void;
  onSwapTokens: () => void;
  onMaxAmount: () => void;
  onExchange: () => void;
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
}: ExchangeFormProps) {
  // Determine if exchange button should be disabled
  const isExchangeDisabled = !fromToken || !toToken || !fromAmount || !toAmount;

  return (
    <div className="p-4">
      {/* From Token */}
      <TokenInput
        label="From"
        token={fromToken}
        amount={fromAmount}
        onAmountChange={onFromAmountChange}
        onSelectToken={onSelectFromToken}
        rightLabel={
          fromToken && (
            <button onClick={onMaxAmount} className="text-xs text-[var(--tuwa-button-gradient-from)] hover:underline cursor-pointer">
              Max: {fromToken.formattedBalance.toFixed(6)}
            </button>
          )
        }
      />

      {/* Swap Button */}
      <SwapButton onSwap={onSwapTokens} />

      {/* To Token */}
      <TokenInput
        label="To"
        token={toToken}
        amount={toAmount}
        onAmountChange={onToAmountChange}
        onSelectToken={onSelectToToken}
      />

      {/* Exchange Rate */}
      {fromToken && toToken && (
        <ExchangeRate
          fromSymbol={fromToken.symbol}
          toSymbol={toToken.symbol}
          fromAmount={fromAmount}
          toAmount={toAmount}
          isLoading={isLoadingRoute}
          route={route}
        />
      )}

      {/* Slippage Settings */}
      <SlippageSettings slippage={slippage} onSlippageChange={onSlippageChange} />

      {/* Exchange Button */}
      <ExchangeButton onExchange={onExchange} disabled={isExchangeDisabled} walletConnected={walletConnected} />
    </div>
  );
}
