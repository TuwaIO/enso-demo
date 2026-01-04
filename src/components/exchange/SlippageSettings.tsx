'use client';

import { AdjustmentsHorizontalIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import * as Slider from '@radix-ui/react-slider';
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

  const handleSliderChange = (values: number[]) => {
    const value = values[0].toString();
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
    <div className="flex mb-2 items-end flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors mb-2 cursor-pointer"
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        <span>Slippage Tolerance: {slippage}%</span>

        {/* Info Icon with Tooltip */}
        <div className="relative group">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-[var(--tuwa-text-primary)] transition-colors cursor-help" />

          {/* Tooltip */}
          <div className="absolute top-[calc(100%+10px)] right-[-10px] mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="font-medium mb-1">What is Slippage Tolerance?</div>
            <div className="text-gray-300 leading-relaxed">
              Permissible price deviation (%) between quoted and execution price of swap. For cross-chain swaps, this
              applies separately to both source and destination chains.
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute bottom-full right-3.5 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-3 bg-[var(--tuwa-bg-secondary)] rounded-lg border border-[var(--tuwa-border-primary)] animate-in fade-in slide-in-from-top-2 duration-200 w-full">
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                      slippage === val
                        ? 'bg-[var(--tuwa-button-gradient-from)] text-white border-transparent'
                        : 'bg-gray-100 text-[var(--tuwa-text-primary)] border-[var(--tuwa-border-primary)] hover:border-gray-400'
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
                  className="w-full pl-3 pr-6 py-1.5 text-xs font-medium bg-gray-100 border border-[var(--tuwa-border-primary)] rounded-md text-[var(--tuwa-text-primary)] focus:outline-none focus:border-[var(--tuwa-button-gradient-from)] text-right"
                  placeholder="Custom"
                />
                <span className="absolute right-2 text-[var(--tuwa-text-secondary)] text-xs">%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-8">0.1%</span>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
                value={[Math.min(parseFloat(slippage) || 0, 5)]}
                onValueChange={handleSliderChange}
                max={5}
                min={0.1}
                step={0.1}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-[var(--tuwa-button-gradient-from)] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-gradient-to-br from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] border-2 border-white shadow-lg rounded-full hover:scale-110 focus:outline-none focus:shadow-[0_0_0_3px] focus:shadow-[var(--tuwa-button-gradient-from)]/30 transition-transform cursor-pointer"
                  aria-label="Slippage"
                />
              </Slider.Root>
              <span className="text-xs text-gray-400 w-8">5.0%</span>
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
