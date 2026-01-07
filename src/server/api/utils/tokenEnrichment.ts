import { BalanceItem, SortedBalanceItem } from '../types/enso';

/**
 * Enrich token data with computed fields for frontend display
 *
 * @param tokens Array of raw token balances
 * @returns Array of enriched token balances with computed fields
 */
export function enrichTokens(tokens: BalanceItem[]): SortedBalanceItem[] {
  return tokens.map((token) => {
    // Calculate human-readable balance (convert from wei to token units)
    const balance = Number(token.amount) / Math.pow(10, token.decimals);

    // Calculate USD value
    const usdValue = balance * token.price;

    // Return token with additional computed fields
    return {
      ...token,
      formattedBalance: balance,
      usdValue,
      formattedUsdValue: usdValue > 0 ? `$${usdValue.toFixed(2)}` : '',
    };
  });
}

/**
 * Calculate total portfolio value from token balances
 *
 * @param tokens Array of enriched token balances
 * @returns Total portfolio value in USD
 */
export function calculatePortfolioValue(tokens: SortedBalanceItem[]): number {
  return tokens.reduce((sum, token) => sum + token.usdValue, 0);
}

/**
 * Generate portfolio statistics
 *
 * @param tokens Array of enriched token balances
 * @returns Object containing portfolio statistics
 */
export function generatePortfolioStats(tokens: SortedBalanceItem[]) {
  const totalTokens = tokens.length;
  const withPrice = tokens.filter((t) => t.price > 0).length;
  const withValue = tokens.filter((t) => t.usdValue > 0).length;
  const totalValue = calculatePortfolioValue(tokens);

  return {
    totalTokens,
    withPrice,
    withValue,
    totalValue,
  };
}
