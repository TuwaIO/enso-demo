import { useCallback, useMemo } from 'react';

import { SortedBalanceItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

interface UseExchangeBalancesProps {
  walletAddress: string;
  walletChainId: number;
  fromChainId: number;
  destinationChainId: number;
}

export function useExchangeBalances({
  walletAddress,
  walletChainId,
  fromChainId,
  destinationChainId,
}: UseExchangeBalancesProps) {
  // Fetch balances for wallet chain
  const { data: walletChainBalances, refetch: refetchWalletChain } = api.enso.getWalletBalances.useQuery(
    {
      address: walletAddress,
      chainId: walletChainId,
    },
    {
      enabled: !!walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress),
      retry: 2,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch balances for from chain (if different from wallet chain)
  const { data: fromChainBalances, refetch: refetchFromChain } = api.enso.getWalletBalances.useQuery(
    {
      address: walletAddress,
      chainId: fromChainId,
    },
    {
      enabled: !!walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress) && fromChainId !== walletChainId,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch balances for destination chain (if different from others)
  const { data: destinationChainBalances, refetch: refetchDestinationChain } = api.enso.getWalletBalances.useQuery(
    {
      address: walletAddress,
      chainId: destinationChainId,
    },
    {
      enabled:
        !!walletAddress &&
        /^0x[a-fA-F0-9]{40}$/.test(walletAddress) &&
        destinationChainId !== walletChainId &&
        destinationChainId !== fromChainId,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  );

  // Consolidated balance management
  const allBalances = useMemo(() => {
    const balances: Record<number, SortedBalanceItem[]> = {};

    if (walletChainBalances) {
      balances[walletChainId] = walletChainBalances;
    }

    if (fromChainBalances && fromChainId !== walletChainId) {
      balances[fromChainId] = fromChainBalances;
    }

    if (destinationChainBalances && destinationChainId !== walletChainId && destinationChainId !== fromChainId) {
      balances[destinationChainId] = destinationChainBalances;
    }

    return balances;
  }, [
    walletChainBalances,
    fromChainBalances,
    destinationChainBalances,
    walletChainId,
    fromChainId,
    destinationChainId,
  ]);

  // Get balances for specific chain
  const getBalancesForChain = useCallback(
    (chainId: number): SortedBalanceItem[] => {
      return allBalances[chainId] || [];
    },
    [allBalances],
  );

  // Refetch all balances
  const refetchBalances = useCallback(async () => {
    if (walletAddress) {
      const promises = [refetchWalletChain()];

      if (fromChainId !== walletChainId) {
        promises.push(refetchFromChain());
      }

      if (destinationChainId !== walletChainId && destinationChainId !== fromChainId) {
        promises.push(refetchDestinationChain());
      }

      await Promise.all(promises);
    }
  }, [
    walletAddress,
    refetchWalletChain,
    refetchFromChain,
    refetchDestinationChain,
    fromChainId,
    destinationChainId,
    walletChainId,
  ]);

  return {
    allBalances,
    getBalancesForChain,
    refetchBalances,
  };
}
