'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface WalletSearchProps {
  onSearch: (address: string) => void;
  initialValue?: string;
  placeholder?: string;
  onReset?: () => void;
}

export function WalletSearch({
  onSearch,
  initialValue = '',
  placeholder = 'Enter wallet address...',
  onReset,
}: WalletSearchProps) {
  const [address, setAddress] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);

  const validateAddress = (value: string): boolean => {
    if (value === '') return true; // Empty is valid (will show connected wallet)
    return /^0x[a-fA-F0-9]{40}$/.test(value); // Basic Ethereum address validation
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setIsValid(validateAddress(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress(address)) {
      onSearch(address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      {/* Reset button at top right - now with X icon and active state */}
      {onReset && (
        <button
          type="button"
          onClick={() => {
            setAddress(''); // Clear the input field
            onReset(); // Call the parent's reset handler
          }}
          className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-white shadow-md hover:shadow-lg active:scale-90 transition-all duration-150 cursor-pointer"
          title="Clear wallet and reset"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}

      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full p-3 pl-10 rounded-lg bg-[var(--tuwa-bg-secondary)] border ${
            isValid ? 'border-[var(--tuwa-border-primary)]' : 'border-red-500'
          } text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-button-gradient-from)]`}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-[var(--tuwa-text-secondary)]" />
        </div>
      </div>

      {!isValid && (
        <p className="mt-1 text-sm text-red-500">
          Please enter a valid Ethereum address or leave empty to view connected wallet
        </p>
      )}

      {/* Search button at bottom center - now with active state */}
      <div className="flex justify-center mt-4">
        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          Search
        </button>
      </div>
    </form>
  );
}
