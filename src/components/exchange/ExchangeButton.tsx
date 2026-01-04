import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ExchangeButtonProps {
  onExchange: () => void;
  disabled: boolean;
  walletConnected: boolean;
  label?: string; // Custom label (e.g., "Approve USDC" vs "Execute")
  isLoading?: boolean; // Loading state for async actions
  variant?: 'primary' | 'secondary'; // Visual style
}

export function ExchangeButton({
  onExchange,
  disabled,
  walletConnected,
  label = 'Execute',
  isLoading = false,
  variant = 'primary',
}: ExchangeButtonProps) {
  return (
    <button
      onClick={onExchange}
      disabled={disabled || isLoading}
      className={clsx(
        'w-full p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 transition-all duration-200',
        variant === 'primary'
          ? 'bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-white shadow-md hover:shadow-lg'
          : 'bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] hover:bg-[var(--tuwa-bg-muted)]',
      )}
    >
      {isLoading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
      {!walletConnected ? 'Connect Wallet' : label}
    </button>
  );
}
