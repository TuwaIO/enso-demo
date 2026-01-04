'use client';

import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { appEVMChains } from '@/configs/appConfig';
import { useDebounce } from '@/hooks/useDebounce';
import { SortedBalanceItem } from '@/server/api/types/enso';

import { ExchangeForm } from './exchange/ExchangeForm';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { useExchangeApproval } from './exchange/hooks/useExchangeApproval';
import { useExchangeBalances } from './exchange/hooks/useExchangeBalances';
import { useExchangeRoute } from './exchange/hooks/useExchangeRoute';
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

  // 🚀 Debounced amount for API calls
  const debouncedFromAmount = useDebounce(fromAmount, 800);

  // Cross-chain state - track selected chains for both from and to
  const [fromChainId, setFromChainId] = useState<number>(1);
  const [destinationChainId, setDestinationChainId] = useState<number>(1);

  // State for token selection modal
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);

  // Track initialization to prevent cascading effects
  const isInitializedRef = useRef(false);

  // Determine if wallet is connected and is EVM
  const isEVMWallet =
    !!activeConnection &&
    !!activeConnection?.connectorType &&
    getAdapterFromConnectorType(activeConnection.connectorType) === OrbitAdapter.EVM;

  // Get wallet address
  const walletAddress = activeConnection?.address ?? '';

  // Use the chain ID from the connected wallet if available, otherwise use Ethereum mainnet
  const walletChainId = isEVMWallet ? Number(activeConnection?.chainId ?? 1) : 1;

  // Initialize chains when wallet connects (only once)
  useEffect(() => {
    if (walletChainId && !isInitializedRef.current) {
      // eslint-disable-next-line
      setFromChainId(walletChainId);
      setDestinationChainId(walletChainId);
      isInitializedRef.current = true;
    }
  }, [walletChainId]);

  // Fetch and manage balances using custom hook
  const { getBalancesForChain } = useExchangeBalances({
    walletAddress,
    walletChainId,
    fromChainId,
    destinationChainId,
  });

  // Set initial from token based on URL param (only when balances change)
  useEffect(() => {
    if (!fromToken && fromTokenAddress) {
      const currentFromBalances = getBalancesForChain(fromChainId);
      if (currentFromBalances.length > 0) {
        const token = currentFromBalances.find((t) => t.token.toLowerCase() === fromTokenAddress.toLowerCase());
        if (token) {
          // Use setTimeout to avoid synchronous state update in effect
          setTimeout(() => setFromToken(token), 0);
        }
      }
    }
  }, [fromTokenAddress, fromToken, fromChainId, getBalancesForChain]);

  // 🔒 Enhanced token swap with protection mechanisms
  const handleSwapTokens = () => {
    // 🛡️ Protection 1: Check if toToken has balance (can't swap to token with 0 balance as fromToken)
    if (toToken && toToken.formattedBalance <= 0) {
      toast.error('❌ Cannot swap: destination token has no balance in your wallet', {
        containerId: 'exchange',
      });
      return;
    }

    // 🛡️ Protection 2: Check if toToken exists in balances (cross-chain protection)
    if (toToken) {
      const toChainBalances = getBalancesForChain(destinationChainId);
      const tokenInWallet = toChainBalances.find(
        (balance) => balance.token.toLowerCase() === toToken.token.toLowerCase(),
      );

      if (!tokenInWallet || tokenInWallet.formattedBalance <= 0) {
        toast.error('❌ Cannot swap: token not available in your wallet or has zero balance', {
          containerId: 'exchange',
        });
        return;
      }
    }

    console.log('🔄 Swapping tokens with protection...');
    console.log('From:', fromToken?.symbol, '→ To:', toToken?.symbol);

    // Store current values
    const tempToken = fromToken;
    const tempChainId = fromChainId;

    // Perform swap
    setFromToken(toToken);
    setToToken(tempToken);
    setFromChainId(destinationChainId);
    setDestinationChainId(tempChainId);

    // 🛡️ Protection 3: Reset amounts to 0 to prevent value inconsistencies
    console.log('💰 Resetting amounts to prevent value inconsistencies');
    setFromAmount('0');
    setToAmount('0');

    // Success toast
    toast.success(`🔄 Swapped ${tempToken?.symbol} ↔ ${toToken?.symbol}`, {
      containerId: 'exchange',
    });

    console.log('✅ Token swap completed successfully');
  };

  // 🛡️ Enhanced from amount change with balance validation and auto-max
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    // 🛡️ Protection 4: Auto-set to max if exceeds balance
    if (fromToken && value && parseFloat(value) > 0) {
      const inputAmount = parseFloat(value);
      const maxBalance = fromToken.formattedBalance;

      if (inputAmount > maxBalance) {
        // Set to maximum balance instead of rejecting
        const maxValue = maxBalance.toString();
        setFromAmount(maxValue);

        toast.error(`💸 Amount exceeds balance! Setting to maximum: ${maxBalance.toFixed(6)} ${fromToken.symbol}`, {
          containerId: 'exchange',
        });

        // Calculate toAmount with max value (simple estimation)
        if (toToken && maxBalance > 0) {
          const fromPrice = fromToken.price || 0;
          const toPrice = toToken.price || 0;
          if (fromPrice > 0 && toPrice > 0) {
            const estimatedTo = (maxBalance * fromPrice) / toPrice;
            setToAmount(estimatedTo.toFixed(6));
          }
        }
        return;
      }
    }

    setFromAmount(value);

    // Simple estimation (real calculation will happen with debounced value)
    if (fromToken && toToken && value && parseFloat(value) > 0) {
      const fromPrice = fromToken.price || 0;
      const toPrice = toToken.price || 0;

      if (fromPrice > 0 && toPrice > 0) {
        const estimatedTo = (parseFloat(value) * fromPrice) / toPrice;
        setToAmount(estimatedTo.toFixed(6));
      }
    } else {
      setToAmount('');
    }
  };

  // Handle to amount change (Bidirectional approximation)
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setToAmount(value);

    if (fromToken && toToken && value && parseFloat(value) > 0) {
      // Approximate From Amount: ToAmount * (ToPrice / FromPrice)
      const fromPrice = fromToken.price || 0;
      const toPrice = toToken.price || 0;

      if (fromPrice > 0 && toPrice > 0) {
        const estimatedFrom = (parseFloat(value) * toPrice) / fromPrice;

        // 🛡️ Validate that estimated from amount doesn't exceed balance
        if (fromToken && estimatedFrom > fromToken.formattedBalance) {
          toast.warning(
            `⚠️ Estimated input (${estimatedFrom.toFixed(6)}) would exceed your ${fromToken.symbol} balance`,
            {
              containerId: 'exchange',
            },
          );
          return;
        }

        setFromAmount(estimatedFrom.toFixed(6));
      }
    }
  };

  // 🚀 Get optimal route using custom hook
  const { optimalRoute, refetchOptimalRoute, isLoadingRoute, isErrorRoute } = useExchangeRoute({
    fromToken,
    toToken,
    debouncedFromAmount,
    fromChainId,
    destinationChainId,
    slippage,
    walletAddress,
    recipientAddress,
  });

  // 🔍 Check for approval using custom hook
  const { approvalData, needsApproval } = useExchangeApproval({
    fromToken,
    walletAddress,
    fromAmount,
    toAmount,
  });
  const isApproving = false; // TODO: Implement actual approval state

  const handleApprove = async () => {
    if (!approvalData) return;
    console.log('📝 Approving token...', {
      ...approvalData,
    });
    // TODO: Implement actual approval transaction
  };

  // Handle optimal route data changes (avoid synchronous state updates)
  useEffect(() => {
    if (optimalRoute && optimalRoute.toAmount && toToken) {
      // Convert the toAmount from wei to the token's decimal representation
      const convertedAmount = (Number(optimalRoute.toAmount) / Math.pow(10, toToken.decimals || 18)).toString();

      // Only update if significantly different
      if (Math.abs(parseFloat(toAmount || '0') - parseFloat(convertedAmount)) > 0.000001) {
        // Use setTimeout to avoid synchronous state update
        setTimeout(() => setToAmount(convertedAmount), 0);
      }
    }
  }, [optimalRoute, toToken, toAmount]);

  // Handle slippage change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlippage(value);
  };

  // 🛡️ Enhanced max amount with balance validation
  const handleMaxAmount = () => {
    if (fromToken) {
      const maxAmount = fromToken.formattedBalance;

      if (maxAmount <= 0) {
        toast.error(`💰 No balance available for ${fromToken.symbol}`, {
          containerId: 'exchange',
        });
        return;
      }

      console.log(`💯 Setting max amount: ${maxAmount} ${fromToken.symbol}`);
      setFromAmount(maxAmount.toString());

      // Success toast for MAX usage
      toast.info(`💯 Using maximum balance: ${maxAmount.toFixed(6)} ${fromToken.symbol}`, {
        containerId: 'exchange',
      });
    }
  };

  // Handle exchange
  const handleExchange = () => {
    // 🛡️ Enhanced validation
    if (!fromToken || !toToken || !fromAmount || !toAmount || !optimalRoute) {
      toast.error('❌ Please select tokens and enter amounts', {
        containerId: 'exchange',
      });
      return;
    }

    // Validate balance one more time before exchange
    if (parseFloat(fromAmount) > fromToken.formattedBalance) {
      toast.error(`💸 Insufficient balance! Available: ${fromToken.formattedBalance.toFixed(6)} ${fromToken.symbol}`, {
        containerId: 'exchange',
      });
      return;
    }

    console.log('🚀 READY FOR PULSAR TRANSACTION 🚀');
    console.log('-----------------------------------');
    console.log('From Token:', fromToken);
    console.log('To Token:', toToken);
    console.log('From Chain:', fromChainId);
    console.log('Destination Chain:', destinationChainId);
    console.log('Amount In:', fromAmount);
    console.log('Amount Out:', toAmount);
    console.log('Slippage:', slippage);
    console.log('Recipient:', recipientAddress || walletAddress);
    console.log('Route Data:', optimalRoute);
    console.log('TX Data for Pulsar:', optimalRoute.tx);
    console.log('-----------------------------------');

    // Success toast
    toast.success('🚀 Transaction prepared successfully! Check console for details.', {
      containerId: 'exchange',
    });
  };

  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] gap-4 flex-wrap relative min-h-[calc(100dvh-65px)] pt-8">
      {/* Token Selection Modals */}
      <>
        {/* Source Token Selector: Multi-chain support with dynamic chain selection */}
        <TokenSelectModal
          isOpen={isSelectingFromToken}
          onClose={() => setIsSelectingFromToken(false)}
          tokens={getBalancesForChain(fromChainId)}
          chainId={fromChainId}
          onSelectToken={(token) => {
            console.log(`🔄 Selected from token: ${token.symbol} (Balance: ${token.formattedBalance})`);
            setFromToken(token);
            if (toToken && token.token === toToken.token && fromChainId === destinationChainId) {
              setToToken(null); // Clear destination if same token selected on same chain
            }
            // Clear amounts when changing tokens to prevent inconsistencies
            setFromAmount('');
            setToAmount('');

            // Success toast for token selection
            toast.success(`✅ Selected ${token.symbol} (${token.formattedBalance.toFixed(4)} available)`, {
              containerId: 'exchange',
            });
          }}
          selectedTokenAddress={fromToken?.token}
          filterByBalance={true}
          enableChainSelection={true}
          chains={appEVMChains}
          onSelectChain={(newChainId) => {
            setFromChainId(newChainId);
            setFromToken(null); // Clear selected token when chain changes
            setFromAmount('');
            setToAmount('');

            // Toast for chain change
            const selectedChain = appEVMChains.find((chain) => chain.id === newChainId);
            toast.info(`🔗 From network changed to ${selectedChain?.name || 'Unknown'}`, {
              containerId: 'exchange',
            });
          }}
          disabledTokenAddresses={toToken && fromChainId === destinationChainId ? [toToken.token] : []}
        />

        {/* Destination Token Selector: Multi-chain support */}
        <TokenSelectModal
          isOpen={isSelectingToToken}
          onClose={() => setIsSelectingToToken(false)}
          tokens={getBalancesForChain(destinationChainId)}
          chainId={destinationChainId}
          onSelectToken={(token) => {
            console.log(`🎯 Selected to token: ${token.symbol}`);
            setToToken(token);
            if (fromToken && token.token === fromToken.token && fromChainId === destinationChainId) {
              setFromToken(null);
            }
            // Clear amounts when changing tokens
            setFromAmount('');
            setToAmount('');

            // Success toast for destination token
            toast.success(`🎯 Destination set to ${token.symbol}`, {
              containerId: 'exchange',
            });
          }}
          selectedTokenAddress={toToken?.token}
          filterByBalance={false}
          enableChainSelection={true}
          chains={appEVMChains}
          onSelectChain={(newChainId) => {
            setDestinationChainId(newChainId);
            setToToken(null); // Clear selected token when chain changes
            setFromAmount('');
            setToAmount('');

            // Toast for chain change
            const selectedChain = appEVMChains.find((chain) => chain.id === newChainId);
            toast.info(`🔗 Destination network changed to ${selectedChain?.name || 'Unknown'}`, {
              containerId: 'exchange',
            });
          }}
          disabledTokenAddresses={fromToken && fromChainId === destinationChainId ? [fromToken.token] : []}
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
            isErrorRoute={isErrorRoute}
            walletConnected={!!walletAddress}
            route={optimalRoute?.route}
            gas={optimalRoute?.gas}
            gasPrice={optimalRoute?.gasPrice}
            nativeCurrency={optimalRoute?.nativeCurrency}
            minAmountOut={optimalRoute?.minAmountOut}
            priceImpact={optimalRoute?.priceImpact != null ? Number(optimalRoute.priceImpact) : undefined}
            onFromAmountChange={handleFromAmountChange}
            onToAmountChange={handleToAmountChange}
            onSlippageChange={handleSlippageChange}
            onSelectFromToken={() => setIsSelectingFromToken(true)}
            onSelectToToken={() => setIsSelectingToToken(true)}
            onSwapTokens={handleSwapTokens}
            onMaxAmount={handleMaxAmount}
            onExchange={handleExchange}
            currentWalletAddress={activeConnection?.address}
            recipientAddress={recipientAddress}
            onRecipientChange={setRecipientAddress}
            onRefresh={() => {
              refetchOptimalRoute();
              toast.info('🔄 Refreshing route data...', {
                containerId: 'exchange',
              });
            }}
            chains={appEVMChains}
            needsApproval={needsApproval}
            isApproving={isApproving}
            onApprove={handleApprove}
          />
        </div>
      </div>
    </div>
  );
}
