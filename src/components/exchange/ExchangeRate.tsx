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
          <svg
            className="mr-1"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="3" x2="15" y1="22" y2="22"></line>
            <line x1="4" x2="14" y1="9" y2="9"></line>
            <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
            <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path>
          </svg>
          <span className="truncate">{gasInfo}</span>
        </div>
      )}
    </div>
  );
}
