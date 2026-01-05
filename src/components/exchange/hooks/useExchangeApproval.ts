import { useEffect, useState } from 'react';

import { SortedBalanceItem } from '@/server/api/types/enso';
import { api } from '@/utils/trpc';

interface UseExchangeApprovalProps {
  fromToken: SortedBalanceItem | null;
  walletAddress: string;
  fromAmount: string;
  toAmount: string;
}

export function useExchangeApproval({ fromToken, walletAddress, fromAmount, toAmount }: UseExchangeApprovalProps) {
  const [needsApproval, setNeedsApproval] = useState(false);

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
      retry: 2,
      retryDelay: 5000,
    },
  );

  useEffect(() => {
    setNeedsApproval(!!approvalData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalData?.tx]);

  return {
    approvalData,
    chainIdForApprove: fromToken?.chainId ?? 1,
    needsApproval,
    setNeedsApproval,
  };
}
