'use client';

import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SortedBalanceItem } from '@/server/api/routers/enso';
import { api } from '@/utils/trpc';

import { ExchangeForm } from './exchange/ExchangeForm';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { TokenSelectModal } from './TokenSelectModal';

export default function ExchangePage() {
  const router = useRouter();
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
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

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

  // Fetch wallet balances
  const { data: balances, isLoading: isLoadingBalances } = api.enso.getWalletBalances.useQuery(
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
      const token = balances.find((token) => token.token.toLowerCase() === fromTokenAddress.toLowerCase());
      if (token) {
        setFromToken(token);
      }
    }
  }, [balances, fromTokenAddress, fromToken]);

  // Handle token swap
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
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
      chainId,
      slippage: parseFloat(slippage),
    },
    {
      enabled: !!fromToken && !!toToken && !!fromAmount && parseFloat(fromAmount) > 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  // Handle optimal route data changes
  useEffect(() => {
    if (optimalRoute && optimalRoute.toAmount && toToken) {
      // Convert the toAmount from wei to the token's decimal representation
      const convertedAmount = (Number(optimalRoute.toAmount) / Math.pow(10, toToken.decimals || 18)).toString();
      setToAmount(convertedAmount);
    }
  }, [optimalRoute, toToken]);

  // Handle from amount change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);

    // If we have both tokens, refetch the optimal route
    if (fromToken && toToken && value && parseFloat(value) > 0) {
      refetchOptimalRoute();
    } else {
      setToAmount('');
    }
  };

  // Handle to amount change
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToAmount(value);

    // Note: For simplicity, we're not implementing reverse calculation
    // In a real app, you would call a different API endpoint to calculate
    // the fromAmount based on the toAmount
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

      // If we have both tokens, refetch the optimal route
      if (toToken) {
        // We need to wait for the state to update before refetching
        setTimeout(() => {
          refetchOptimalRoute();
        }, 0);
      }
    }
  };

  // Handle exchange
  const handleExchange = () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount || !optimalRoute) {
      alert('Please select tokens and enter amounts');
      return;
    }

    // In a real application, you would:
    // 1. Call a smart contract to execute the swap
    // 2. Show a loading state while the transaction is pending
    // 3. Show a success message when the transaction is complete

    // For this demo, we'll just show the route details
    alert(
      `Exchange Summary:\n\n` +
        `From: ${fromAmount} ${fromToken.symbol}\n` +
        `To: ${toAmount} ${toToken.symbol}\n` +
        `Rate: 1 ${fromToken.symbol} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken.symbol}\n` +
        `Slippage Tolerance: ${slippage}%\n\n` +
        `This is a demo. In a real application, this would execute the swap.`,
    );
  };

  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] gap-4 flex-wrap relative min-h-[calc(100dvh-65px)] pt-8">
      {/* Token Selection Modals */}
      {balances && (
        <>
          <TokenSelectModal
            isOpen={isSelectingFromToken}
            onClose={() => setIsSelectingFromToken(false)}
            tokens={balances}
            onSelectToken={(token) => {
              setFromToken(token);
              // If the selected token is the same as the to token, swap them
              if (toToken && token.token === toToken.token) {
                setToToken(fromToken);
              }
              // If we have both tokens and an amount, refetch the route
              if (toToken && fromAmount) {
                refetchOptimalRoute();
              }
            }}
            selectedTokenAddress={fromToken?.token}
          />

          <TokenSelectModal
            isOpen={isSelectingToToken}
            onClose={() => setIsSelectingToToken(false)}
            tokens={balances}
            onSelectToken={(token) => {
              setToToken(token);
              // If the selected token is the same as the from token, swap them
              if (fromToken && token.token === fromToken.token) {
                setFromToken(toToken);
              }
              // If we have both tokens and an amount, refetch the route
              if (fromToken && fromAmount) {
                refetchOptimalRoute();
              }
            }}
            selectedTokenAddress={toToken?.token}
          />
        </>
      )}

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
            onFromAmountChange={handleFromAmountChange}
            onToAmountChange={handleToAmountChange}
            onSlippageChange={handleSlippageChange}
            onSelectFromToken={() => setIsSelectingFromToken(true)}
            onSelectToToken={() => setIsSelectingToToken(true)}
            onSwapTokens={handleSwapTokens}
            onMaxAmount={handleMaxAmount}
            onExchange={handleExchange}
          />
        </div>
      </div>
    </div>
  );
}
