'use client';

import { BanknotesIcon, CheckIcon, ClipboardIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useCopyToClipboard } from '@tuwaio/nova-core';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Chain } from 'viem/chains';

import { AssetsList } from './AssetsList';
import { NetworkSelector } from './NetworkSelector';
import { WalletSearch } from './WalletSearch';

// Export the SearchInputSection component for use in other files
export { SearchInputSection };

// Reusable card container component
interface CardContainerProps {
  children: ReactNode;
}

function CardContainer({ children }: CardContainerProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.1, 0.1, 0.2, 1] }}
      className="p-4 w-full max-w-2xl"
    >
      <div className="bg-[var(--tuwa-bg-primary)] rounded-2xl shadow-2xl border border-[var(--tuwa-border-primary)] overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

// Reusable card header component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  address?: string;
  onCopyAddress?: () => void;
  isCopied?: boolean;
  assets: any[] | undefined;
}

// Reusable network selector section component
interface NetworkSelectorSectionProps {
  chains: readonly Chain[];
  selectedChainId: number;
  onSelectChain: (chainId: number) => void;
}

function NetworkSelectorSection({ chains, selectedChainId, onSelectChain }: NetworkSelectorSectionProps) {
  return (
    <div className="p-4 border-b border-[var(--tuwa-border-primary)]">
      <div className="mb-2 text-sm font-medium text-[var(--tuwa-text-secondary)]">Select Network:</div>
      <NetworkSelector chains={chains} selectedChainId={selectedChainId} onSelectChain={onSelectChain} />
    </div>
  );
}

// Reusable search input section component
interface SearchInputSectionProps {
  onSearch: (address: string) => void;
  initialValue?: string;
  placeholder?: string;
  onReset?: () => void;
}

function SearchInputSection({ onSearch, initialValue = '', placeholder, onReset }: SearchInputSectionProps) {
  return (
    <div className="p-4 border-b border-[var(--tuwa-border-primary)]">
      <WalletSearch
        onSearch={onSearch}
        initialValue={initialValue}
        placeholder={placeholder || 'Enter wallet address to view assets...'}
        onReset={onReset}
      />
    </div>
  );
}

function CardHeader({ title, subtitle, icon, address, onCopyAddress, isCopied = false, assets }: CardHeaderProps) {
  const calculateTotalBalance = () => {
    if (!assets || assets.length === 0) return 0;
    return assets.reduce((sum, t) => sum + t.usdValue, 0);
  };

  const totalBalanceUSD = calculateTotalBalance();

  return (
    <div className="bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 p-2 rounded-full bg-white/20">{icon}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-blue-100 text-sm">{subtitle}</p>
          </div>
        </div>

        {!!assets?.length && (
          <div className="flex justify-end mb-3">
            <div className="bg-[var(--tuwa-bg-secondary)] px-4 py-2 rounded-lg shadow-md">
              <p className="text-sm font-medium">Total Balance</p>
              <p className="text-xl font-bold">${totalBalanceUSD.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Address with Copy Button */}
      {address && onCopyAddress && (
        <div className="mt-3 flex items-center justify-between bg-white/10 rounded-lg p-2">
          <div className="text-sm font-mono text-white font-medium">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </div>
          <button
            onClick={onCopyAddress}
            className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded px-2 py-1 transition-colors cursor-pointer"
            title={isCopied ? 'Copied!' : 'Copy full address'}
          >
            {isCopied ? (
              <>
                <CheckIcon className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ClipboardIcon className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

interface WalletAssetsCardProps {
  title: string;
  subtitle?: string;
  address?: string;
  isLoading: boolean;
  assets: any[] | undefined;
  error?: string;
  children?: React.ReactNode;
  // Network selector props
  showNetworkSelector?: boolean;
  chains?: readonly Chain[];
  selectedChainId?: number;
  onSelectChain?: (chainId: number) => void;
  isWalletConnected?: boolean;
}

export function WalletAssetsCard({
  title,
  subtitle = 'Powered by TUWA using Enso API',
  address,
  isLoading,
  assets,
  error,
  children,
  showNetworkSelector = false,
  chains = [],
  selectedChainId = 1,
  onSelectChain = () => {},
  isWalletConnected = true,
}: WalletAssetsCardProps) {
  // Use the copy to clipboard hook
  const { isCopied, copy } = useCopyToClipboard();

  // Function to copy address to clipboard
  const copyAddressToClipboard = () => {
    if (address) {
      copy(address).catch((err) => {
        console.error('Failed to copy address: ', err);
      });
    }
  };

  return (
    <CardContainer>
      {/* Header */}
      <CardHeader
        title={title}
        subtitle={subtitle}
        icon={<BanknotesIcon className="w-full h-full text-white" />}
        address={address}
        onCopyAddress={copyAddressToClipboard}
        isCopied={isCopied}
        assets={assets}
      />

      {/* Search Input (if provided) */}
      {children}

      {/* Network Selector (if enabled and not wallet connected) */}
      {showNetworkSelector && !isWalletConnected && chains.length > 0 && (
        <NetworkSelectorSection chains={chains} selectedChainId={selectedChainId} onSelectChain={onSelectChain} />
      )}

      {/* Content */}
      <div className="p-4">
        <AssetsList assets={assets} isLoading={isLoading} error={error} />
      </div>
    </CardContainer>
  );
}

interface WalletRequiredCardProps {
  onSearch: (address: string) => void;
  chains: readonly Chain[];
  selectedChainId: number;
  onSelectChain: (chainId: number) => void;
  searchAddress?: string;
  onReset?: () => void;
}

export function WalletRequiredCard({
  onSearch,
  chains,
  selectedChainId,
  onSelectChain,
  searchAddress = '',
  onReset,
}: WalletRequiredCardProps) {
  return (
    <CardContainer>
      {/* Header */}
      <CardHeader
        title="Wallet Explorer"
        subtitle="Search any wallet or connect yours"
        icon={<WalletIcon className="w-full h-full text-white" />}
        assets={[]}
      />

      {/* Search Input */}
      <SearchInputSection
        onSearch={onSearch}
        initialValue={searchAddress}
        placeholder="Enter wallet address to view assets..."
        onReset={onReset}
      />

      {/* Network Selector */}
      <NetworkSelectorSection chains={chains} selectedChainId={selectedChainId} onSelectChain={onSelectChain} />

      {/* Content */}
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--tuwa-bg-secondary)] flex items-center justify-center">
          <WalletIcon className="w-8 h-8 text-[var(--tuwa-text-secondary)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--tuwa-text-primary)] mb-2">No Wallet Connected</h2>
        <p className="text-[var(--tuwa-text-secondary)] mb-4">
          Connect your wallet to view your assets or search for any wallet address above.
        </p>
      </div>
    </CardContainer>
  );
}
