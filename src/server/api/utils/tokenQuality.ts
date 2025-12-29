import { BalanceItem, SortedBalanceItem } from '../types/enso';

/**
 * Calculate a quality score for a token based on various attributes
 * Higher scores indicate more likely legitimate tokens
 * 
 * @param token Token with balance and value information
 * @returns Quality score (0-100)
 */
export function calculateTokenQuality(token: BalanceItem & { formattedBalance: number; usdValue: number }): number {
  let score = 0;

  // Higher score for tokens with price
  if (token.price > 0) score += 50;

  // Higher score for reasonable symbol length (3-6 chars is typical)
  if (token.symbol.length >= 3 && token.symbol.length <= 6) score += 15;

  // Higher score for reasonable name length
  if (token.name.length >= 3 && token.name.length <= 30) score += 10;

  // Higher score for meaningful USD value
  if (token.usdValue > 1) score += 30;
  else if (token.usdValue > 0.1) score += 15;
  else if (token.usdValue > 0.01) score += 5;

  // Lower score for very long names/symbols (potential spam)
  if (token.symbol.length > 10) score -= 10;
  if (token.name.length > 40) score -= 10;

  return Math.max(0, score);
}

/**
 * Sort tokens by quality score, USD value, then alphabetically
 * 
 * @param balances Array of token balances to sort
 * @returns Sorted array of token balances
 */
export function sortTokensByValue(balances: SortedBalanceItem[]): typeof balances {
  return balances.sort((a, b) => {
    const qualityA = calculateTokenQuality(a);
    const qualityB = calculateTokenQuality(b);

    // Sort by quality score first
    if (qualityA !== qualityB) {
      return qualityB - qualityA;
    }

    // Then by USD value (highest first)
    if (a.usdValue !== b.usdValue) {
      return b.usdValue - a.usdValue;
    }

    // If USD values are equal, sort by price (highest first)
    if (a.price !== b.price) {
      return b.price - a.price;
    }

    // Finally, sort alphabetically by symbol
    return a.symbol.localeCompare(b.symbol);
  });
}