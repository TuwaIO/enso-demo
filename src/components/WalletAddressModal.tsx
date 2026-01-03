'use client';

import { CloseIcon, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@tuwaio/nova-core';
import { useState } from 'react';

interface WalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onAddressChange: (address: string) => void;
}

export function WalletAddressModal({ isOpen, onClose, currentAddress, onAddressChange }: WalletAddressModalProps) {
  const [address, setAddress] = useState(currentAddress);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    // Clear previous error
    setErrorMessage(null);

    // Basic validation for Ethereum address
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      onAddressChange(address);
      onClose();
    } else {
      setErrorMessage('Please enter a valid Ethereum address');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-[var(--tuwa-bg-primary)] rounded-xl p-0">
        {/* Header */}
        <DialogHeader className="flex items-center justify-between p-4 border-b border-[var(--tuwa-border-primary)] shrink-0">
          <DialogTitle className="text-lg font-bold text-[var(--tuwa-text-primary)]">Edit Wallet Address</DialogTitle>
          <DialogClose asChild>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--tuwa-bg-secondary)] cursor-pointer text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors">
              <CloseIcon className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 text-sm font-medium text-[var(--tuwa-text-secondary)]">
            Enter the wallet address where you want to receive tokens
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              // Clear error when user starts typing
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="0x..."
            className={`w-full p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border ${
              errorMessage ? 'border-red-500 dark:border-red-700' : 'border-[var(--tuwa-border-primary)]'
            } text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-button-gradient-from)] font-mono`}
          />

          {/* Error Message */}
          {errorMessage && <div className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</div>}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              className="cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
