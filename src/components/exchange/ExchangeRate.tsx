import { useMemo } from 'react';

interface ExchangeRateProps {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
}

export function ExchangeRate({ fromSymbol, toSymbol, fromAmount, toAmount, isLoading }: ExchangeRateProps) {
  // 📊 Memoized exchange rate calculation
  const exchangeRate = useMemo(() => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0 || parseFloat(toAmount) === 0) {
      return null;
    }
    return (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6);
  }, [fromAmount, toAmount]);

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
    </div>
  );
}
