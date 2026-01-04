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

      {/* Spacer */}
      <div className="h-4"></div>

      {/* Exchange Button */}
      <ExchangeButton onExchange={onExchange} disabled={isExchangeDisabled} walletConnected={walletConnected} />
    </div>
  );
}
