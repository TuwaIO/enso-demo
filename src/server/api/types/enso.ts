import { Address } from 'viem';

/**
 * Represents a token balance item from the Enso API response
 */
export type BalanceItem = {
  token: string;
  amount: string;
  chainId: number;
  decimals: number;
  price: number;
  name: string;
  symbol: string;
  logoUri: string | null;
};

/**
 * Extended balance item with additional computed fields for frontend display
 */
export type SortedBalanceItem = BalanceItem & {
  formattedBalance: number;
  usdValue: number;
  formattedUsdValue: string;
};

/**
 * Represents a token item from the Enso API tokens endpoint
 */
export type TokenItem = {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logosUri?: string[];
};

/**
 * Display token type for UI components - combines API tokens with wallet balance data
 */
export type DisplayToken = {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  balance: string;
  usdValue: string;
  hasBalance: boolean; // Indicates if this token is in user's wallet
};

export type HopToken = {
  chainId: number;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  logosUri?: string[];
  type?: string;
};

export type Hop = {
  tokenIn: HopToken[];
  tokenOut: HopToken[];
  protocol: string;
  action: string;
  primary: Address;
  internalRoutes: string[];
  args: Record<string, any>;
  chainId: number;
  sourceChainId?: number;
  destinationChainId?: number;
};
