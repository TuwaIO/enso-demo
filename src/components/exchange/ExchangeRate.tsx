import { PriceData } from '@ensofinance/sdk';
import { FireIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';
import { formatUnits } from 'viem';

interface ExchangeRateProps {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
  gas?: number | string;
  gasPrice?: number | string;
  nativeCurrency?: PriceData;
}

export function ExchangeRate({
  fromSymbol,
  toSymbol,
  fromAmount,
  toAmount,
  isLoading,
  gas,
  gasPrice,
  nativeCurrency,
}: ExchangeRateProps) {
  // 📊 Memoized exchange rate calculation
  const exchangeRate = useMemo(() => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0 || parseFloat(toAmount) === 0) {
      return null;
    }
    return (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6);
  }, [fromAmount, toAmount]);

  // ⛽ Memoized gas cost calculation with optimized formatting
  const gasInfo = useMemo(() => {
    if (!gas || !gasPrice || !nativeCurrency) return null;

    try {
      const gasInWei = BigInt(gas.toString()) * BigInt(gasPrice.toString());
      const gasInNative = parseFloat(formatUnits(gasInWei, nativeCurrency.decimals));
      const gasInUSD = gasInNative * Number(nativeCurrency.price);

      // 🎯 Smart decimal formatting for native currency
      let nativeFormatted: string;
      if (gasInNative >= 0.01) {
        nativeFormatted = gasInNative.toFixed(4);
      } else if (gasInNative >= 0.001) {
        nativeFormatted = gasInNative.toFixed(5);
      } else {
        nativeFormatted = gasInNative.toFixed(6);
      }

      // 💰 Fixed 4 decimal places for USD
      const usdFormatted = gasInUSD.toFixed(4);

      return `${nativeFormatted} ${nativeCurrency.symbol} ($${usdFormatted})`;
    } catch (error) {
      console.error('Error formatting gas:', error);
      return null;
    }
  }, [gas, gasPrice, nativeCurrency]);

  // 🔄 Loading state
  if (isLoading) {
    return (
      <div className="flex items-center text-xs text-gray-400 animate-pulse">
        <span>Calculating rate...</span>
      </div>
    );
  }

  // 📭 No data to display
  if (!exchangeRate) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full gap-4">
      {/* 📈 Exchange Rate */}
      <div className="text-xs text-gray-400 font-medium flex-shrink-0">
        1 {fromSymbol} ≈ {exchangeRate} {toSymbol}
      </div>

      {/* ⛽ Gas Cost */}
      {gasInfo && (
        <div className="flex items-center text-xs text-gray-400 gap-1 flex-shrink-0">
          <svg className="w-4 h-4" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
            <path d="m19.77 7.23.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77M18 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1M8 18v-4.5H6L10 6v5h2z"></path>
          </svg>
          <span className="truncate">{gasInfo}</span>
        </div>
      )}
    </div>
  );
}
