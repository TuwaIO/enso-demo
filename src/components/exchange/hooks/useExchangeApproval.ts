import { SortedBalanceItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

interface UseExchangeApprovalProps {
  fromToken: SortedBalanceItem | null;
  walletAddress: string;
  fromAmount: string;
  toAmount: string;
}

export function useExchangeApproval({ fromToken, walletAddress, fromAmount, toAmount }: UseExchangeApprovalProps) {
  const { data: approvalData } = api.enso.getApprovalData.useQuery(
    {
      chainId: fromToken?.chainId ?? 1,
      fromAddress: walletAddress ?? '',
      tokenAddress: fromToken?.token ?? '',
      amount: fromAmount,
      decimals: fromToken?.decimals ?? 18,
    },
    {
      enabled: !!fromToken && !!walletAddress && parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0,
      refetchInterval: 10000,
      retry: 5,
    },
  );

  return {
    approvalData,
    chainIdForApprove: fromToken?.chainId ?? 1,
    needsApproval: !!approvalData,
  };
}
