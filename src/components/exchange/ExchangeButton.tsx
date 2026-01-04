'use client';

interface ExchangeButtonProps {
  onExchange: () => void;
  disabled: boolean;
  walletConnected: boolean;
}

export function ExchangeButton({ onExchange, disabled, walletConnected }: ExchangeButtonProps) {
  return (
    <button
      onClick={onExchange}
      disabled={disabled}
      className="w-full p-3 rounded-lg bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {!walletConnected ? 'Connect Wallet to Execute' : 'Execute'}
    </button>
  );
}
