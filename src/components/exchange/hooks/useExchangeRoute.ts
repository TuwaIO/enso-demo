import { SortedBalanceItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

interface UseExchangeRouteProps {
  fromToken: SortedBalanceItem | null;
  toToken: SortedBalanceItem | null;
  debouncedFromAmount: string;
  fromChainId: number;
  destinationChainId: number;
  slippage: string;
  walletAddress: string;
  recipientAddress: string;
}

export function useExchangeRoute({
  fromToken,
  toToken,
  debouncedFromAmount,
  fromChainId,
  destinationChainId,
  slippage,
  walletAddress,
  recipientAddress,
}: UseExchangeRouteProps) {
  const {
    data: optimalRoute,
    refetch: refetchOptimalRoute,
    isLoading: isLoadingRoute,
    isError: isErrorRoute,
  } = api.enso.getOptimalRoute.useQuery(
    {
      fromToken: fromToken?.token || '',
      toToken: toToken?.token || '',
      amount: debouncedFromAmount
        ? (parseFloat(debouncedFromAmount) * Math.pow(10, fromToken?.decimals || 18)).toString()
        : '0',
      chainId: fromChainId,
      slippage: parseFloat(slippage),
      fromAddress: walletAddress,
      receiver: recipientAddress || undefined,
      destinationChainId,
    },
    {
      enabled:
        !!fromToken && !!toToken && !!debouncedFromAmount && parseFloat(debouncedFromAmount) > 0 && !!walletAddress,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  return {
    optimalRoute,
    refetchOptimalRoute,
    isLoadingRoute,
    isErrorRoute,
  };
}
