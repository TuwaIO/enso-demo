import { PriceData } from '@ensofinance/sdk';
import { Chain } from 'viem/chains';

import { Hop, SortedBalanceItem } from '@/server/api/types/enso';

export interface ExchangeRouteData {
  route?: Hop[];
  gas?: number | string;
  gasPrice?: number | string;
  nativeCurrency?: PriceData;
  minAmountOut?: string;
  priceImpact?: number;
}

export interface ExchangeState {
  fromToken: SortedBalanceItem | null;
  toToken: SortedBalanceItem | null;
  fromAmount: string;
  toAmount: string;
  slippage: string;
  recipientAddress: string;
  isLoadingRoute: boolean;
  isErrorRoute: boolean;
}

export interface ExchangeFormProps extends ExchangeState, ExchangeRouteData {
  walletConnected: boolean;
  onFromAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlippageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectFromToken: () => void;
  onSelectToToken: () => void;
  onSwapTokens: () => void;
  onMaxAmount: () => void;
  onExchange: () => Promise<void>;
  onRecipientChange: (address: string) => void;
  onRefresh: () => void;
  chains?: readonly Chain[];
  currentWalletAddress?: string;
  needsApproval?: boolean;
  onApprove?: () => Promise<void>;
}

export interface TokenInputProps {
  label: string;
  token: SortedBalanceItem | null;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectToken: () => void;
  disabled?: boolean;
  walletAddress?: string;
  onWalletAddressChange?: (address: string) => void;
  showNetworkInfo?: boolean;
  chains?: readonly Chain[];
  onMaxAmount: () => void;
  isLoadingRoute?: boolean;
}
