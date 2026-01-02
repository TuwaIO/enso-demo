'use client';

import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { appEVMChains } from '@/configs/appConfig';
import { SortedBalanceItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

import { ExchangeForm } from './exchange/ExchangeForm';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { TokenSelectModal } from './TokenSelectModal';

export default function ExchangePage() {
  const searchParams = useSearchParams();
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);

  // Get token address from URL query params
  const fromTokenAddress = searchParams.get('from') || '';

  // State for exchange form
  const [fromToken, setFromToken] = useState<SortedBalanceItem | null>(null);
  const [toToken, setToToken] = useState<SortedBalanceItem | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [recipientAddress, setRecipientAddress] = useState('');

  // Cross-chain state
  // Destination chain defaults to connected chain, but can be changed
  const [destinationChainId, setDestinationChainId] = useState<number>(1);

  // State for token selection modal
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);

  // Determine if wallet is connected and is EVM
  const isEVMWallet =
    !!activeConnection &&
    !!activeConnection?.connectorType &&
    getAdapterFromConnectorType(activeConnection.connectorType) === OrbitAdapter.EVM;

  // Get wallet address
  const walletAddress = activeConnection?.address ?? '';

  // Use the chain ID from the connected wallet if available, otherwise use Ethereum mainnet
  const chainId = isEVMWallet ? Number(activeConnection?.chainId ?? 1) : 1;

  // Update destination chain when wallet chain changes (initially)
  useEffect(() => {
    if (chainId && destinationChainId === 1) {
        setDestinationChainId(chainId);
    }
  }, [chainId, destinationChainId]);

  // Fetch wallet balances
  const { data: balances } = api.enso.getWalletBalances.useQuery(
    {
      address: walletAddress,
      chainId,
    },
    {
      enabled: !!walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress),
      retry: 2,
      refetchOnWindowFocus: false,
    },
  );

  // Set initial from token based on URL param
  useEffect(() => {
    if (balances && fromTokenAddress && !fromToken) {
      const token = balances.find((t) => t.token.toLowerCase() === fromTokenAddress.toLowerCase());
      if (token) {
        setFromToken(token);
      }
    }
  }, [balances, fromTokenAddress, fromToken]);

  // Handle token swap
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Swap amounts implies exact input becomes exact output which we don't fully support vertically without recalculation
    // For now, keep "From" amount as the input driver if possible, or swap values
    setFromAmount(toAmount);
    setToAmount(tempAmount);

    // If we are swapping across chains, we might need to swap chainIds too theoretically, 
    // but source chain is locked to wallet. 
    // If destination chain was different, we can't easily swap if source chain doesn't match wallet.
    // So usually swap button is disabled or resets destination chain to current if cross-chain logic is strict.
    // For this demo, let's just reset destination chain to current if it was different? 
    // Or assume user wants to send back. But user can only send from connected chain.
    setDestinationChainId(chainId);
  };

  // Get optimal route between tokens
  const {
    data: optimalRoute,
    refetch: refetchOptimalRoute,
    isLoading: isLoadingRoute,
  } = api.enso.getOptimalRoute.useQuery(
    {
      fromToken: fromToken?.token || '',
      toToken: toToken?.token || '',
      amount: fromAmount ? (parseFloat(fromAmount) * Math.pow(10, fromToken?.decimals || 18)).toString() : '0',
      chainId, // Source chain
      slippage: parseFloat(slippage),
      fromAddress: walletAddress,
      receiver: recipientAddress || undefined,
    },
    {
      enabled: !!fromToken && !!toToken && !!fromAmount && parseFloat(fromAmount) > 0 && !!walletAddress,
      retry: 1,
      refetchOnWindowFocus: false,
      // Refetch automatically? We'll handle via explicit timer to be safe and efficient
    },
  );

  // Handle optimal route data changes
  useEffect(() => {
    if (optimalRoute && optimalRoute.toAmount && toToken) {
      // Convert the toAmount from wei to the token's decimal representation
      const convertedAmount = (Number(optimalRoute.toAmount) / Math.pow(10, toToken.decimals || 18)).toString();
      
       // Using simple formatted string to avoid infinite loops if precision varies slightly
       // Only update if significantly different or if toAmount was empty
      if (toAmount !== convertedAmount) {
         // Check if user is currently editing "To" field? 
         // Basic collision avoidance: if we just fetched a route strictly based on FromAmount, we update ToAmount.
         setToAmount(convertedAmount);
      }
    }
  }, [optimalRoute, toToken]); // Removed intoAmount from dependency to avoid loop

  // Handle from amount change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);

    // Debouncing could be added here
    if (fromToken && toToken && value && parseFloat(value) > 0) {
       // Allow UI to update first, then refetch
       // React Query will refetch because key (amount) changed
    } else {
      setToAmount('');
    }
  };

  // Handle to amount change (Bidirectional approximation)
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToAmount(value);

    if (fromToken && toToken && value && parseFloat(value) > 0) {
        // Approximate From Amount: ToAmount * (ToPrice / FromPrice)
        // Price is usually in USD.
        const fromPrice = fromToken.price || 0;
        const toPrice = toToken.price || 0;

        if (fromPrice > 0 && toPrice > 0) {
            const estimatedFrom = (parseFloat(value) * toPrice) / fromPrice;
            // setFromAmount triggers query update
            setFromAmount(estimatedFrom.toFixed(6)); // Limit decimals to avoid crazy longs
        }
    }
  };

  // Handle slippage change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlippage(value);
  };

  // Handle max amount
  const handleMaxAmount = () => {
    if (fromToken) {
      const maxAmount = fromToken.formattedBalance.toString();
      setFromAmount(maxAmount);
    }
  };

  // Handle exchange
  const handleExchange = () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount || !optimalRoute) {
      alert('Please select tokens and enter amounts');
      return;
    }

    console.log('🚀 READY FOR PULSAR TRANSACTION 🚀');
    console.log('-----------------------------------');
    console.log('From Token:', fromToken);
    console.log('To Token:', toToken);
    console.log('Amount In:', fromAmount);
    console.log('Amount Out:', toAmount);
    console.log('Slippage:', slippage);
    console.log('Recipient:', recipientAddress || walletAddress);
    console.log('Route Data:', optimalRoute);
    console.log('TX Data for Pulsar:', optimalRoute.tx);
    console.log('-----------------------------------');

    alert('Check console for transaction data!');
  };

  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] gap-4 flex-wrap relative min-h-[calc(100dvh-65px)] pt-8">
      {/* Token Selection Modals */}
      <>
        {/* Source Token Selector: Filter by balance, Current Chain only */}
        <TokenSelectModal
          isOpen={isSelectingFromToken}
          onClose={() => setIsSelectingFromToken(false)}
          tokens={balances || []}
          chainId={chainId}
          onSelectToken={(token) => {
            setFromToken(token);
            if (toToken && token.token === toToken.token) {
              setToToken(null); // Clear destination if same token selected (unless cross chain)
            }
          }}
          selectedTokenAddress={fromToken?.token}
          filterByBalance={true}
          enableChainSelection={false} 
        />

        {/* Destination Token Selector: All tokens, Chain Selection enabled */}
        <TokenSelectModal
          isOpen={isSelectingToToken}
          onClose={() => setIsSelectingToToken(false)}
          tokens={balances || []} // Note: sending tokens implies we pick from list of KNOWN tokens, API usually returns all tokens for a chain
          chainId={destinationChainId}
          onSelectToken={(token) => {
            setToToken(token);
            if (fromToken && token.token === fromToken.token && chainId === destinationChainId) {
              setFromToken(null);
            }
          }}
          selectedTokenAddress={toToken?.token}
          filterByBalance={false}
          enableChainSelection={true}
          chains={appEVMChains}
          onSelectChain={(newChainId) => setDestinationChainId(newChainId)}
        />
      </>

      <div className="p-4 w-full max-w-md">
        <div className="bg-[var(--tuwa-bg-primary)] rounded-2xl shadow-2xl border border-[var(--tuwa-border-primary)] overflow-hidden">
          {/* Header */}
          <ExchangeHeader title="Token Exchange" />

          {/* Exchange Form */}
          <ExchangeForm
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            slippage={slippage}
            isLoadingRoute={isLoadingRoute}
            walletConnected={!!walletAddress}
            route={optimalRoute?.route}
            onFromAmountChange={handleFromAmountChange}
            onToAmountChange={handleToAmountChange}
            onSlippageChange={handleSlippageChange}
            onSelectFromToken={() => setIsSelectingFromToken(true)}
            onSelectToToken={() => setIsSelectingToToken(true)}
            onSwapTokens={handleSwapTokens}
            onMaxAmount={handleMaxAmount}
            onExchange={handleExchange}
            recipientAddress={recipientAddress}
            onRecipientChange={setRecipientAddress}
            onRefresh={() => refetchOptimalRoute()}
          />
        </div>
      </div>
    </div>
  );
}
