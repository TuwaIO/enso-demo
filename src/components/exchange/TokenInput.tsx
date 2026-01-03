'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { CheckIcon, ChevronDownIcon, ClipboardIcon, PencilIcon } from '@heroicons/react/24/outline';
import { textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import React, { useState } from 'react';
import { Chain } from 'viem/chains';

import { SortedBalanceItem } from '@/server/api/types/enso';

import { WalletAddressModal } from '../WalletAddressModal';

interface TokenInputProps {
  label: string;
  token: SortedBalanceItem | null;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectToken: () => void;
  rightLabel?: React.ReactNode;
  disabled?: boolean;
  walletAddress?: string;
  onWalletAddressChange?: (address: string) => void;
  showNetworkInfo?: boolean;
  chains?: readonly Chain[];
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
  rightLabel,
  disabled = false,
  walletAddress,
  onWalletAddressChange,
  showNetworkInfo = false,
  chains = [],
}: TokenInputProps) {
  const [isEditingWalletAddress, setIsEditingWalletAddress] = useState(false);
  const { isCopied, copy } = useCopyToClipboard();

  // Find chain info if available
  const chainInfo = token && chains.length > 0 ? chains.find((chain) => chain.id === token.chainId) : null;

  return (
    <div className="bg-[var(--tuwa-bg-tertiary)] p-4 rounded-xl border border-[var(--tuwa-border-primary)] hover:border-[var(--tuwa-border-secondary)] transition-colors group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-[var(--tuwa-text-secondary)] uppercase tracking-wider pl-1">
          {label}
        </label>
        {rightLabel}
      </div>

      {/* Network Information (if enabled and token is selected) */}
      {showNetworkInfo && token && (
        <div className="mb-2 flex items-center gap-2 bg-[var(--tuwa-bg-secondary)] p-2 rounded-lg">
          <Web3Icon chainId={token.chainId} className="w-5 h-5 rounded-full" />
          <span className="text-xs font-medium text-[var(--tuwa-text-secondary)]">
            {chainInfo ? chainInfo.name : `Chain ID: ${token.chainId}`}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Token Selector */}
        <button
          className="flex items-center gap-2 bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-primary)] px-2 py-1.5 rounded-full border border-[var(--tuwa-border-primary)] transition-all min-w-[110px] sm:min-w-[130px] shadow-sm cursor-pointer"
          onClick={onSelectToken}
        >
          {token ? (
            <>
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                {token.logoUri ? (
                  <img src={token.logoUri} alt={token.symbol} className="w-full h-full object-cover" />
                ) : (
                  <Web3Icon symbol={token.symbol} className="w-full h-full" />
                )}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-bold text-[var(--tuwa-text-primary)] leading-tight truncate w-full text-left">
                  {token.symbol}
                </span>
                <span className="text-[10px] text-[var(--tuwa-text-secondary)] leading-tight truncate w-full text-left">
                  {token.name}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm font-medium text-[var(--tuwa-text-primary)] pl-1">Select Token</span>
          )}
          <ChevronDownIcon className="w-4 h-4 text-[var(--tuwa-text-secondary)] ml-auto" />
        </button>

        {/* Input Field */}
        <div className="flex-1 flex flex-col items-end min-w-0">
          <input
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder="0"
            disabled={disabled}
            className="w-full bg-transparent text-right text-2xl font-bold text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          />
          {token && amount && parseFloat(amount) > 0 && (
            <div className="text-xs text-[var(--tuwa-text-secondary)] mt-1 font-medium">
              {/* Placeholder for USD calculation based on token price */}
              {token.price ? `≈ $${(parseFloat(amount) * token.price).toFixed(2)}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Address Display (if provided and label is "Buy") */}
      {walletAddress && label === 'Buy' && onWalletAddressChange && (
        <div className="mt-3 flex items-center justify-between bg-[var(--tuwa-bg-secondary)] p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--tuwa-text-secondary)]">Receiving address:</span>
            <span className="text-xs font-mono text-[var(--tuwa-text-primary)]">
              {textCenterEllipsis(walletAddress, 5, 5)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => walletAddress && copy(walletAddress)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--tuwa-bg-tertiary)] text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-button-gradient-from)] transition-colors"
              title={isCopied ? 'Copied!' : 'Copy address'}
            >
              {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsEditingWalletAddress(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--tuwa-bg-tertiary)] text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-button-gradient-from)] transition-colors"
              title="Edit address"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wallet Address Edit Modal */}
      {onWalletAddressChange && (
        <WalletAddressModal
          isOpen={isEditingWalletAddress}
          onClose={() => setIsEditingWalletAddress(false)}
          currentAddress={walletAddress || ''}
          onAddressChange={onWalletAddressChange}
        />
      )}
    </div>
  );
}
