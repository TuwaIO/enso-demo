'use client';

import { Hop } from '@/server/api/types/enso';

interface ExchangeRateProps {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
  route?: Hop[];
}

export function ExchangeRate({ fromSymbol, toSymbol, fromAmount, toAmount, isLoading, route }: ExchangeRateProps) {
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
    <div className="mt-2 text-xs text-[var(--tuwa-text-tertiary)]">
      <div className="text-center">
        Rate: 1 {fromSymbol} = {rate} {toSymbol}
      </div>

      {route && route.length > 0 && (
        <div className="mt-2 p-2 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)]">
          <div className="font-medium mb-1">Route:</div>
          <div className="flex items-center flex-wrap gap-1">
            {route.map((step, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-1">→</span>}
                <span className="px-2 py-1 rounded-md bg-[var(--tuwa-bg-muted)]">{step.action}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
