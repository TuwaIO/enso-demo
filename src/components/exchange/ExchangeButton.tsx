import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { TxActionButton } from '@tuwaio/nova-transactions';

import { usePulsarStore } from '@/hooks/pulsarStoreHook';

interface ExchangeButtonProps {
  onExchange: () => Promise<void>;
  disabled?: boolean;
  walletConnected: boolean;
  label?: string; // Custom label (e.g., "Approve USDC" vs "Execute")
  isLoading?: boolean; // Loading state for async actions
}

export function ExchangeButton({
  onExchange,
  disabled,
  walletConnected,
  label = 'Execute',
  isLoading = false,
}: ExchangeButtonProps) {
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const getLastTxKey = usePulsarStore((state) => state.getLastTxKey);
  const activeConnection = useSatelliteConnectStore((state) => state.activeConnection);

  return (
    <TxActionButton
      action={onExchange}
      transactionsPool={transactionsPool}
      getLastTxKey={getLastTxKey}
      disabled={disabled || isLoading}
      walletAddress={activeConnection?.address}
      className={
        'w-full p-2 sm:p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 transition-all duration-200'
      }
    >
      {isLoading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
      {!walletConnected ? 'Connect Wallet' : label}
    </TxActionButton>
  );
}
