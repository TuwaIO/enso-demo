'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { CheckIcon, ChevronDownIcon, ClipboardIcon, PencilIcon } from '@heroicons/react/24/outline';
import { textCenterEllipsis, useCopyToClipboard } from '@tuwaio/nova-core';
import React, { useState } from 'react';
import { formatUnits } from 'viem';
import { Chain } from 'viem/chains';

import { SortedBalanceItem } from '@/server/api/types/enso';

import { WalletAddressModal } from '../WalletAddressModal';

interface TokenInputProps {
  label: string;
  token: SortedBalanceItem | null;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectToken: () => void;
  disabled?: boolean;
  walletAddress?: string;
  onWalletAddressChange?: (address: string) => void;
  showNetworkInfo?: boolean;
  chains?: readonly Chain[];
  onMaxAmount: () => void;
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
  disabled = false,
  walletAddress,
  onWalletAddressChange,
  chains = [],
  onMaxAmount,
}: TokenInputProps) {
  const [isEditingWalletAddress, setIsEditingWalletAddress] = useState(false);
  const { isCopied, copy } = useCopyToClipboard();

  // Find chain info
  const chainInfo = token && chains.length > 0 ? chains.find((chain) => chain.id === token.chainId) : null;

  // Format Balance for display
  const formattedBalance =
    token?.amount && token.decimals
      ? Number(formatUnits(BigInt(token.amount), token.decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })
      : '0';

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 1. TOP ROW: Label & Wallet Info */}
      <div className="flex justify-between items-end px-1">
        <label className="text-xs font-bold text-[var(--tuwa-text-secondary)] uppercase tracking-wider">{label}</label>

        {/* Wallet Address / Actions (Moved to Top Right) */}
        {walletAddress && onWalletAddressChange ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--tuwa-text-tertiary)] hidden sm:inline">To wallet:</span>
            <div className="flex items-center gap-1 bg-[var(--tuwa-bg-tertiary)] px-2 py-0.5 rounded-md border border-[var(--tuwa-border-primary)]/50">
              <span className="text-xs font-mono text-[var(--tuwa-text-secondary)]">
                {textCenterEllipsis(walletAddress, 4, 4)}
              </span>
              <div className="w-[1px] h-3 bg-[var(--tuwa-border-primary)] mx-1" />
              <button
                onClick={() => copy(walletAddress)}
                className="cursor-pointer hover:text-[var(--tuwa-text-primary)] text-[var(--tuwa-text-tertiary)] transition-colors"
              >
                {isCopied ? <CheckIcon className="w-3 h-3 text-green-500" /> : <ClipboardIcon className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setIsEditingWalletAddress(true)}
                className="cursor-pointer hover:text-[var(--tuwa-text-primary)] text-[var(--tuwa-text-tertiary)] transition-colors"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* Placeholder if needed or empty */
          <div />
        )}
      </div>

      {/* 2. MIDDLE & BOTTOM: The Double Block (Card) */}
      <div className="bg-[var(--tuwa-bg-tertiary)] rounded-xl border border-[var(--tuwa-border-primary)] overflow-hidden hover:border-[var(--tuwa-border-secondary)] transition-all duration-200 shadow-sm">
        {/* BLOCK PART 1: Token Selector (Full Width Button) */}
        <button
          onClick={onSelectToken}
          className="w-full flex items-center justify-between p-3 bg-[var(--tuwa-bg-secondary)] hover:bg-[var(--tuwa-bg-primary)] transition-colors border-b border-[var(--tuwa-border-primary)]/50 cursor-pointer group/selector"
        >
          <div className="flex items-center gap-3">
            {/* Icon Stack: Token + Network Badge */}
            <div className="relative w-8 h-8">
              {token ? (
                <>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[var(--tuwa-bg-tertiary)]">
                    {token.logoUri ? (
                      <img src={token.logoUri} alt={token.symbol} className="w-full h-full object-cover" />
                    ) : (
                      <Web3Icon symbol={token.symbol} className="w-full h-full" />
                    )}
                  </div>
                  {/* Network Badge (Absolute Bottom Right) */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--tuwa-bg-secondary)] overflow-hidden bg-[var(--tuwa-bg-primary)] flex items-center justify-center">
                    <Web3Icon chainId={token.chainId} className="w-full h-full" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full rounded-full bg-[var(--tuwa-bg-tertiary)] animate-pulse" />
              )}
            </div>

            {/* Text Info: Symbol + Network Name */}
            <div className="flex flex-col items-start">
              {token ? (
                <>
                  <span className="text-base font-bold text-[var(--tuwa-text-primary)] leading-none">
                    {token.symbol}
                  </span>
                  <span className="text-[10px] text-[var(--tuwa-text-secondary)] font-medium mt-0.5 group-hover/selector:text-[var(--tuwa-text-primary)] transition-colors">
                    {chainInfo?.name || 'Unknown Network'}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-[var(--tuwa-text-primary)]">Select Token</span>
              )}
            </div>
          </div>

          <ChevronDownIcon className="w-5 h-5 text-[var(--tuwa-text-secondary)] group-hover/selector:text-[var(--tuwa-text-primary)] transition-colors" />
        </button>

        {/* BLOCK PART 2: Inputs & Values */}
        <div className="p-3">
          {/* Row A: Input + MAX Button */}
          <div className="flex items-center gap-3 mb-2">
            <input
              type="number"
              value={amount}
              onChange={onAmountChange}
              placeholder="0.00"
              disabled={disabled}
              className="flex-1 bg-transparent text-2xl font-bold text-[var(--tuwa-text-primary)] placeholder:text-[var(--tuwa-text-tertiary)] focus:outline-none disabled:opacity-50 font-mono leading-none"
            />
            {token && label === 'Sell' && (
              <button
                onClick={onMaxAmount}
                disabled={!token.amount || disabled}
                className="cursor-pointer text-[10px] font-bold bg-[var(--tuwa-button-gradient-from)]/10 text-[var(--tuwa-button-gradient-from)] hover:bg-[var(--tuwa-button-gradient-from)] hover:text-white px-2 py-1 rounded transition-all uppercase disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--tuwa-button-gradient-from)]"
              >
                Max
              </button>
            )}
          </div>

          {/* Row B: USD Value + Balance */}
          <div className="flex justify-between items-center text-xs text-[var(--tuwa-text-secondary)] font-medium">
            <div>
              {token && amount && parseFloat(amount) > 0 && token.price ? (
                `≈ $${(parseFloat(amount) * token.price).toFixed(2)}`
              ) : (
                <span className="text-[var(--tuwa-text-tertiary)]">$0.00</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[var(--tuwa-text-tertiary)]">Balance:</span>
              <span className="text-[var(--tuwa-text-primary)] truncate max-w-[120px]" title={formattedBalance}>
                {formattedBalance}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
