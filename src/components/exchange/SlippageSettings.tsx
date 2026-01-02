'use client';

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface SlippageSettingsProps {
  slippage: string;
  onSlippageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SlippageSettings({ slippage, onSlippageChange }: SlippageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customSlippage, setCustomSlippage] = useState(slippage);

  useEffect(() => {
    setCustomSlippage(slippage);
  }, [slippage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow empty string for clearing input
    if (value === '') {
      setCustomSlippage('');
      return;
    }

    // Validate number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Limit to max 10%
    if (numValue > 10) value = '10';

    setCustomSlippage(value);
    onSlippageChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleBlur = () => {
    if (customSlippage === '' || parseFloat(customSlippage) < 0.1) {
      setCustomSlippage('0.5');
      onSlippageChange({ target: { value: '0.5' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const predefinedValues = ['0.1', '0.5', '1.0'];

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors mb-2"
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        <span>Slippage Tolerance: {slippage}%</span>
      </button>

      {isOpen && (
        <div className="p-3 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                {predefinedValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setCustomSlippage(val);
                      onSlippageChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      slippage === val
                        ? 'bg-[var(--tuwa-button-gradient-from)] text-white border-transparent'
                        : 'bg-[var(--tuwa-bg-tertiary)] text-[var(--tuwa-text-primary)] border-[var(--tuwa-border-primary)] hover:border-[var(--tuwa-text-tertiary)]'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <div className="relative flex items-center w-24">
                <input
                  type="number"
                  value={customSlippage}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  step="0.1"
                  min="0.1"
                  max="10"
                  className="w-full pl-3 pr-6 py-1.5 text-xs font-medium bg-[var(--tuwa-bg-tertiary)] border border-[var(--tuwa-border-primary)] rounded-md text-[var(--tuwa-text-primary)] focus:outline-none focus:border-[var(--tuwa-button-gradient-from)] text-right"
                  placeholder="Custom"
                />
                <span className="absolute right-2 text-[var(--tuwa-text-secondary)] text-xs">%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--tuwa-text-tertiary)] w-8">0.1%</span>
              <input
                type="range"
                min="0.1"
                max="5" // Slider goes to 5 generally, input allows to 10
                step="0.1"
                value={Math.min(parseFloat(slippage) || 0, 5)}
                onChange={handleInputChange}
                className="flex-1 h-1.5 bg-[var(--tuwa-bg-tertiary)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--tuwa-button-gradient-from)]"
              />
              <span className="text-xs text-[var(--tuwa-text-tertiary)] w-8">5.0%</span>
            </div>
            {parseFloat(slippage) > 5 && (
              <div className="text-xs text-orange-400 font-medium">
                High slippage! Your transaction may be frontrun.
              </div>
            )}
            {parseFloat(slippage) < 0.5 && (
              <div className="text-xs text-orange-400 font-medium">Low slippage! Your transaction may fail.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
