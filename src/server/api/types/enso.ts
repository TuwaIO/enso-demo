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
