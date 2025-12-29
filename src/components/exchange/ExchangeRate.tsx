'use client';

interface ExchangeRateProps {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
}

export function ExchangeRate({ fromSymbol, toSymbol, fromAmount, toAmount, isLoading }: ExchangeRateProps) {
  if (isLoading) {
    return (
      <div className="mt-2 text-xs text-[var(--tuwa-text-tertiary)] animate-pulse text-center">
        Calculating best rate...
      </div>
    );
  }

  if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0 || parseFloat(toAmount) === 0) {
    return null;
  }

  const rate = (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6);

  return (
    <div className="mt-2 text-xs text-[var(--tuwa-text-tertiary)] text-center">
      Rate: 1 {fromSymbol} = {rate} {toSymbol}
    </div>
  );
}