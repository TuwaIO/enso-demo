'use client';

import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import { useState } from 'react';

import { appEVMChains } from '@/configs/appConfig';
import { api } from '@/utils/trpc';

import { SearchInputSection, WalletAssetsCard, WalletRequiredCard } from './WalletAssetsCard';

export default function HomePage() {
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedChainId, setSelectedChainId] = useState(1); // Default to Ethereum mainnet

  const isEVMWallet =
    !!activeConnection &&
    !!activeConnection?.connectorType &&
    getAdapterFromConnectorType(activeConnection.connectorType) === OrbitAdapter.EVM;

  // Determine which address to use for fetching balances
  const addressToUse = searchAddress || (activeConnection?.address ?? '');

  // Use the chain ID from the connected wallet if available, otherwise use the selected chain ID
  const chainIdToUse = isEVMWallet ? Number(activeConnection?.chainId ?? selectedChainId) : selectedChainId;

  // Fetch wallet balances using tRPC query
  const {
    data: balances,
    isLoading,
    error,
  } = api.enso.getWalletBalances.useQuery(
    {
      address: addressToUse,
      chainId: chainIdToUse,
    },
    {
      // Only enable the query if we have a valid address (either from search or connected wallet)
      enabled: !!addressToUse && /^0x[a-fA-F0-9]{40}$/.test(addressToUse),
      // Retry failed queries a few times
      retry: 2,
      // Don't refetch on window focus to avoid unnecessary API calls
      refetchOnWindowFocus: false,
    },
  );

  // Handle search submission
  const handleSearch = (address: string) => {
    setSearchAddress(address);
  };

  // Handle chain selection
  const handleSelectChain = (chainId: number) => {
    setSelectedChainId(chainId);
  };

  // Handle reset of search and network
  const handleReset = () => {
    setSearchAddress('');
    setSelectedChainId(1); // Reset to Ethereum mainnet
  };

  // Format error message from API
  const errorMessage = error ? error.message || 'Failed to fetch wallet balances. Please try again.' : undefined;

  // Common props for WalletAssetsCard
  const commonWalletAssetsCardProps = {
    address: addressToUse,
    isLoading,
    assets: balances,
    error: errorMessage,
  };

  // Common props for SearchInputSection
  const commonSearchInputProps = {
    onSearch: handleSearch,
    initialValue: searchAddress,
    placeholder: 'Enter wallet address to view assets...',
    onReset: handleReset,
  };

  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] gap-4 flex-wrap relative min-h-[calc(100dvh-65px)] pt-8">
      {/* Show wallet assets if we have a valid search address or connected wallet */}
      {searchAddress ? (
        <WalletAssetsCard
          {...commonWalletAssetsCardProps}
          title="Wallet Assets"
          subtitle={`Viewing wallet on ${appEVMChains.find((chain) => chain.id === chainIdToUse)?.name || 'Unknown Network'}`}
          // Add network selector when wallet is not connected
          showNetworkSelector={!isEVMWallet}
          chains={appEVMChains}
          selectedChainId={selectedChainId}
          onSelectChain={handleSelectChain}
          isWalletConnected={isEVMWallet}
        >
          <SearchInputSection {...commonSearchInputProps} />
        </WalletAssetsCard>
      ) : isEVMWallet ? (
        /* Show connected wallet assets */
        <WalletAssetsCard
          {...commonWalletAssetsCardProps}
          title="Assets list"
          subtitle="Connected wallet assets"
          isWalletConnected={true}
        >
          <SearchInputSection {...commonSearchInputProps} />
        </WalletAssetsCard>
      ) : (
        /* Show wallet required card with search functionality */
        <WalletRequiredCard
          chains={appEVMChains}
          selectedChainId={selectedChainId}
          onSelectChain={handleSelectChain}
          searchAddress={searchAddress}
          onSearch={commonSearchInputProps.onSearch}
          onReset={commonSearchInputProps.onReset}
        />
      )}
    </div>
  );
}
