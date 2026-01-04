'use client';

import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface ExchangeDetailsProps {
  minAmountOut?: string;
  priceImpact?: number;
  fromSymbol?: string;
  toSymbol?: string;
}

export function ExchangeDetails({ minAmountOut, priceImpact, fromSymbol, toSymbol }: ExchangeDetailsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!minAmountOut && typeof priceImpact === 'undefined') {
    return null;
  }

  const formattedPriceImpact = priceImpact ? priceImpact / 100 : 0;

  // Determine color for price impact
  let impactColor = 'text-[var(--tuwa-text-secondary)]';
  let showWarning = false;

  if (formattedPriceImpact) {
    if (formattedPriceImpact > 5) {
      impactColor = 'text-red-500';
      showWarning = true;
    } else if (formattedPriceImpact > 2) {
      impactColor = 'text-yellow-500';
      showWarning = true;
    } else if (formattedPriceImpact < 0) {
      impactColor = 'text-green-500'; // Positive impact (surplus)
    }
  }

  const tooltipText =
    showWarning && fromSymbol && toSymbol
      ? `High price impact (${Math.abs(formattedPriceImpact).toFixed(2)}%). Low ${toSymbol} liquidity causes high value loss for this ${fromSymbol} swap.`
      : '';

  return (
    <div className="mt-4 space-y-2 text-xs text-[var(--tuwa-text-secondary)]">
      {minAmountOut && (
        <div className="flex justify-between items-center">
          <span>Minimum Received</span>
          <span className="font-medium text-[var(--tuwa-text-primary)]">
            {minAmountOut} {toSymbol}
          </span>
        </div>
      )}
      {typeof formattedPriceImpact !== 'undefined' && (
        <div className="flex justify-between items-center">
          <span>Price Impact</span>
          <div className="flex items-center gap-1">
            <span className={`font-medium ${impactColor}`}>
              {formattedPriceImpact > 0 ? '-' : ''}
              {Math.abs(formattedPriceImpact).toFixed(2)}%
            </span>
            {showWarning && (
              <div className="relative">
                <ShieldExclamationIcon
                  className={`w-4 h-4 cursor-help transition-colors duration-200 leading-none ${
                    formattedPriceImpact > 5
                      ? 'text-red-500 hover:text-red-400'
                      : 'text-yellow-500 hover:text-yellow-400'
                  }`}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && tooltipText && (
                  <div className="absolute bottom-full right-[-10px] mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 z-50">
                    <div className="text-center leading-relaxed">{tooltipText}</div>
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>{' '}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
