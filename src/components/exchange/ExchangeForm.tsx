'use client';

import { PriceData } from '@ensofinance/sdk';
import { Chain } from 'viem/chains';

import { Hop, SortedBalanceItem } from '@/server/api/types/enso';

import { ExchangeButton } from './ExchangeButton';
import { ExchangeDetails } from './ExchangeDetails';
import { ExchangeRate } from './ExchangeRate';
import { RefreshTimer } from './RefreshTimer';
import { RouteDetails } from './RouteDetails';
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
  gas?: number | string;
  gasPrice?: number | string;
  nativeCurrency?: PriceData;
  minAmountOut?: string;
  priceImpact?: number;
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
      {fromToken && toToken && Number(fromAmount) > 0 && Number(toAmount) > 0 && (
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

      <ExchangeButton onExchange={onExchange} disabled={isExchangeDisabled} walletConnected={walletConnected} />
    </div>
  );
}
