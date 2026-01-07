'use client';

import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/orbit-core';
// import { TransactionStatus, TransactionTracker } from '@tuwaio/pulsar-core';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { Hex } from 'viem';

import { ExchangeSuccess } from '@/components/exchange/ExchangeSuccess';
import { appEVMChains } from '@/configs/appConfig';
import { usePulsarStore } from '@/hooks/pulsarStoreHook';
import { useDebounce } from '@/hooks/useDebounce';
import { SortedBalanceItem } from '@/server/api/types/enso';
import { ExchangeUsingENSOAPITX, txActions, TxType } from '@/transactions';
import { api } from '@/utils/trpc';

import { ExchangeForm } from './exchange/ExchangeForm';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { useExchangeApproval } from './exchange/hooks/useExchangeApproval';
import { useExchangeBalances } from './exchange/hooks/useExchangeBalances';
import { useExchangeRoute } from './exchange/hooks/useExchangeRoute';
import { TokenSelectModal } from './TokenSelectModal';

export default function ExchangePage() {
  const searchParams = useSearchParams();
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);

  // Get token address from URL query params
  const fromTokenAddress = searchParams.get('from') || '';

  // Determine if wallet is connected and is EVM
  const isEVMWallet =
    !!activeConnection &&
    !!activeConnection?.connectorType &&
    getAdapterFromConnectorType(activeConnection.connectorType) === OrbitAdapter.EVM;

  const walletAddress = activeConnection?.address ?? '';
  const walletChainId = isEVMWallet ? Number(activeConnection?.chainId ?? 1) : 1;

  // 🎯 Get initial chain ID based on wallet connection
  const getInitialChainId = () => {
    return walletAddress && isEVMWallet ? walletChainId : 1;
  };

  // State for exchange form
  const [fromToken, setFromToken] = useState<SortedBalanceItem | null>(null);
  const [toToken, setToToken] = useState<SortedBalanceItem | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isExchangeSuccess, setIsExchangeSuccess] = useState(false);
  const [exchangeTx, setExchangeTx] = useState<ExchangeUsingENSOAPITX | null>(null);

  // 🚀 Debounced amount for API calls
  const debouncedFromAmount = useDebounce(fromAmount, 800);

  // Cross-chain state - track selected chains for both from and to
  const [fromChainId, setFromChainId] = useState<number>(getInitialChainId());
  const [destinationChainId, setDestinationChainId] = useState<number>(getInitialChainId());

  // State for token selection modal
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(false);
  const [isSelectingToToken, setIsSelectingToToken] = useState(false);

  const handleReset = () => {
    const initialChainId = getInitialChainId();

    setIsExchangeSuccess(false);
    setExchangeTx(null);
    setFromToken(null);
    setToToken(null);
    setFromAmount('');
    setToAmount('');
    setSlippage('0.5');
    setRecipientAddress('');
    setFromChainId(initialChainId);
    setDestinationChainId(initialChainId);
    setIsSelectingFromToken(false);
    setIsSelectingToToken(false);
  };

  // 🔄 Initialize chain IDs on wallet connection
  useEffect(() => {
    const initialChainId = getInitialChainId();
    setFromChainId(initialChainId);
    setDestinationChainId(initialChainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection?.isConnected]);

  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection?.address]);

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

  // 🔄 Fetch price for toToken if it's 0 (API token)
  const { data: toTokenPrice } = api.enso.getTokenPrice.useQuery(
    {
      chainId: destinationChainId,
      address: toToken?.token || '',
    },
    {
      enabled: !!toToken && toToken.price === 0,
      refetchOnWindowFocus: false,
    },
  );

  // Update toToken with fetched price
  useEffect(() => {
    if (toToken && toTokenPrice && toToken.price === 0 && toTokenPrice > 0) {
      setTimeout(() => {
        setToToken((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            price: toTokenPrice,
            usdValue: prev.formattedBalance * toTokenPrice,
            formattedUsdValue:
              prev.formattedBalance * toTokenPrice > 0 ? `$${(prev.formattedBalance * toTokenPrice).toFixed(2)}` : '',
          };
        });
      }, 0);
    }
  }, [toTokenPrice, toToken]);

  // 🔒 Enhanced token swap with protection mechanisms
  const handleSwapTokens = () => {
    // 🛡️ Protection 0: Check if toToken exists
    if (!toToken) {
      toast.error('Cannot swap: please select destination token first', {
        containerId: 'exchange',
      });
      return;
    }

    // 🛡️ Protection 1: Check if toToken has balance (can't swap to token with 0 balance as fromToken)
    if (toToken && toToken.formattedBalance <= 0) {
      toast.error('Cannot swap: destination token has no balance in your wallet', {
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
        toast.error('Cannot swap: token not available in your wallet or has zero balance', {
          containerId: 'exchange',
        });
        return;
      }
    }

    // Store current values
    const tempToken = fromToken;
    const tempChainId = fromChainId;

    // Perform swap
    setFromToken(toToken);
    setToToken(tempToken);
    setFromChainId(destinationChainId);
    setDestinationChainId(tempChainId);

    // 🛡️ Protection 3: Reset amounts to 0 to prevent value inconsistencies
    setFromAmount('0');
    setToAmount('0');

    // Success toast
    toast.success(`🔄 Swapped ${tempToken?.symbol} ↔ ${toToken?.symbol}`, {
      containerId: 'exchange',
    });
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
  const { approvalData, needsApproval, chainIdForApprove, setNeedsApproval } = useExchangeApproval({
    fromToken,
    walletAddress,
    fromAmount,
    toAmount,
  });

  const handleApprove = async () => {
    if (!approvalData) return;

    await executeTxAction({
      actionFunction: () =>
        txActions.approveENSOContact({
          data: approvalData.tx.data as Hex,
          to: approvalData.tx.to,
        }),
      onSuccessCallback: (tx) => {
        if (tx.type === TxType.approveENSOContact) {
          setNeedsApproval(false);
        }
      },
      params: {
        type: TxType.approveENSOContact,
        adapter: OrbitAdapter.EVM,
        desiredChainID: chainIdForApprove,
        title: ['Approving', 'Approved', 'Error during approval', 'Approve tx replaced'],
        description: [
          `You can swap ${fromToken?.symbol} to ${toToken?.symbol} after approve.`,
          `Success. You approve ${fromToken?.symbol}. Amount: ${toAmount}($${Number(toAmount) * Number(toTokenPrice ?? '0')}). Spender: ${approvalData.spender}`,
          'Something went wrong during approval.',
          'Transaction replaced. Please take a look details in your wallet.',
        ],
        payload: {
          chainId: chainIdForApprove,
          amountNative: fromToken?.formattedBalance,
          amountUSD: fromToken?.formattedUsdValue,
          tokenAddress: fromToken?.token,
          tokenSymbol: fromToken?.symbol,
          fromAmount,
          toAmount,
        },
        withTrackedModal: true,
      },
    });
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
      setFromAmount(maxAmount.toString());
    }
  };

  // Handle exchange
  const handleExchange = async () => {
    // TODO: remove after testing
    // setIsExchangeSuccess(true);
    // setExchangeTx({
    //   type: TxType.exchangeUsingENSOAPI,
    //   adapter: OrbitAdapter.EVM,
    //   title: ['Swapping', 'Swapped', 'Error during swap', 'Swap tx replaced'],
    //   description: [
    //     `You start swaping ${fromToken?.symbol} to ${toToken?.symbol}.`,
    //     `Success. You swaped ${fromToken?.symbol} to ${toToken?.symbol}. Amount: ${fromToken?.formattedBalance}(${fromToken?.formattedUsdValue})`,
    //     'Something went wrong during Swapping.',
    //     'Transaction replaced. Please take a look details in your wallet.',
    //   ],
    //   payload: {
    //     chainIdFrom: fromToken?.chainId ?? 1,
    //     chainIdTo: toToken?.chainId ?? 1,
    //     tokenAddressFrom: fromToken?.token ?? '',
    //     tokenSymbolFrom: fromToken?.symbol ?? '',
    //     tokenAddressTo: toToken?.token ?? '',
    //     tokenSymbolTo: toToken?.symbol ?? '',
    //     fromAmount: fromAmount ?? '0',
    //     toAmount: toAmount ?? '0',
    //   },
    //   connectorType: 'evm:metamask',
    //   from: '0x15cF4b7Ed91E803246f6F210cD96847CE7e84488',
    //   tracker: TransactionTracker.Ethereum,
    //   chainId: 1,
    //   localTimestamp: 1767637855,
    //   txKey: '0x961603faab8aa8ead2e6bde72419de012e17d20728c82c647e3d7f1fa1d23447',
    //   hash: '0x961603faab8aa8ead2e6bde72419de012e17d20728c82c647e3d7f1fa1d23447',
    //   pending: false,
    //   isTrackedModalOpen: false,
    //   to: '0xf75584ef6673ad213a685a1b58cc0330b8ea22cf',
    //   input: '0x00',
    //   value: '108499489307683',
    //   nonce: 79,
    //   maxFeePerGas: '253565528',
    //   maxPriorityFeePerGas: '100000',
    //   status: TransactionStatus.Success,
    //   isError: false,
    //   finishedTimestamp: 1767637895,
    // });

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

    await executeTxAction({
      actionFunction: () =>
        txActions.swapUsingENSOAPI({
          data: optimalRoute.tx.data as Hex,
          to: optimalRoute.tx.to,
          value: optimalRoute.tx.value as string,
          gas: optimalRoute.gas.toString(),
        }),
      onSuccessCallback: (tx) => {
        if (tx.type === TxType.exchangeUsingENSOAPI) {
          setIsExchangeSuccess(true);
          setExchangeTx(tx);
        }
      },
      params: {
        type: TxType.exchangeUsingENSOAPI,
        adapter: OrbitAdapter.EVM,
        desiredChainID: chainIdForApprove,
        title: ['Swapping', 'Swapped', 'Error during swap', 'Swap tx replaced'],
        description: [
          `You start swaping ${fromToken?.symbol} to ${toToken?.symbol}.`,
          `Success. You swaped ${fromToken?.symbol} to ${toToken?.symbol}. Amount: ${toAmount} ($${Number(toAmount) * Number(toTokenPrice ?? 0)})`,
          'Something went wrong during Swapping.',
          'Transaction replaced. Please take a look details in your wallet.',
        ],
        payload: {
          chainIdFrom: fromToken?.chainId,
          chainIdTo: toToken?.chainId,
          tokenAddressFrom: fromToken?.token,
          tokenSymbolFrom: fromToken?.symbol,
          tokenAddressTo: toToken?.token,
          tokenSymbolTo: toToken?.symbol,
          fromAmount: fromAmount,
          toAmount: toAmount,
        },
        withTrackedModal: true,
      },
    });
  };

  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-[var(--tuwa-bg-secondary)] to-[var(--tuwa-bg-muted)] gap-4 flex-wrap relative min-h-[calc(100dvh-65px)] pt-8">
      {isExchangeSuccess && <Confetti recycle={false} width={window.innerWidth} height={window.innerHeight} />}

      {/* Token Selection Modals */}
      <>
        {/* Source Token Selector: Multi-chain support with dynamic chain selection */}
        <TokenSelectModal
          isOpen={isSelectingFromToken}
          onClose={() => setIsSelectingFromToken(false)}
          tokens={getBalancesForChain(fromChainId)}
          chainId={fromChainId}
          onSelectToken={(token) => {
            setFromToken(token);
            if (toToken && token.token === toToken.token && fromChainId === destinationChainId) {
              setToToken(null); // Clear destination if same token selected on same chain
            }
            setFromAmount('');
            setToAmount('');
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
            setToToken(token);
            if (fromToken && token.token === fromToken.token && fromChainId === destinationChainId) {
              setFromToken(null);
            }
            setFromAmount('');
            setToAmount('');
          }}
          selectedTokenAddress={toToken?.token}
          filterByBalance={false}
          enableChainSelection={true}
          chains={appEVMChains}
          onSelectChain={(newChainId) => {
            setDestinationChainId(newChainId);
            setToToken(null);
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
          {isExchangeSuccess && fromToken && toToken && exchangeTx ? (
            <ExchangeSuccess fromToken={fromToken} toToken={toToken} tx={exchangeTx} onClose={handleReset} />
          ) : (
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
              onApprove={handleApprove}
            />
          )}
        </div>
      </div>
    </div>
  );
}
