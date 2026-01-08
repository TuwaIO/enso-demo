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
