'use client';

interface ExchangeDetailsProps {
  minAmountOut?: string;
  priceImpact?: number;
  toSymbol?: string;
}

export function ExchangeDetails({ minAmountOut, priceImpact, toSymbol }: ExchangeDetailsProps) {
  if (!minAmountOut && typeof priceImpact === 'undefined') {
    return null;
  }

  const formattedPriceImpact = priceImpact ? priceImpact / 100 : 0;

  // Determine color for price impact
  let impactColor = 'text-[var(--tuwa-text-secondary)]';
  if (formattedPriceImpact) {
    if (formattedPriceImpact > 5) impactColor = 'text-red-500';
    else if (formattedPriceImpact > 2) impactColor = 'text-yellow-500';
    else if (formattedPriceImpact < 0) impactColor = 'text-green-500'; // Positive impact (surplus)
  }

  return (
    <div className="mt-4 space-y-2 text-xs text-[var(--tuwa-text-secondary)]">
      {minAmountOut && (
        <div className="flex justify-between items-center">
          <span>Minimum Received</span>
          <span className="font-medium text-[var(--tuwa-text-primary)]">
            {parseFloat(minAmountOut).toFixed(6)} {toSymbol}
          </span>
        </div>
      )}
      {typeof formattedPriceImpact !== 'undefined' && (
        <div className="flex justify-between items-center">
          <span>Price Impact</span>
          <span className={`font-medium ${impactColor}`}>
            {formattedPriceImpact > 0 ? '-' : ''}
            {Math.abs(formattedPriceImpact).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
