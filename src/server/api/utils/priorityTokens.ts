import { TokenItem } from '@/server/api/types/enso';

/**
 * Priority token symbols for sorting (most popular EVM tokens)
 */
export const PRIORITY_TOKENS = [
  'USDT', // Tether
  'USDC', // USD Coin
  'ETH', // Ethereum
  'WETH', // Wrapped Ethereum
  'BTC', // Bitcoin
  'WBTC', // Wrapped Bitcoin
  'DAI', // Dai Stablecoin
  'AAVE', // Aave
  'UNI', // Uniswap
  'LINK', // Chainlink
  'MATIC', // Polygon
  'SHIB', // Shiba Inu
  'PEPE', // Pepe
  'ARB', // Arbitrum
  'OP', // Optimism
  'POL',
];

/**
 * Get priority score for token symbol
 * @param symbol Token symbol
 * @returns Priority score (lower is higher priority)
 */
export function getTokenPriority(symbol: string): number {
  const index = PRIORITY_TOKENS.indexOf(symbol.toUpperCase());
  return index === -1 ? 999 : index;
}

/**
 * Sort tokens by priority symbols first, then alphabetically
 * @param tokens Array of tokens to sort
 * @returns Sorted array of tokens
 */
export function sortTokensByPriority(tokens: TokenItem[]): TokenItem[] {
  return tokens.sort((a, b) => {
    const priorityA = getTokenPriority(a.symbol);
    const priorityB = getTokenPriority(b.symbol);

    // Sort by priority first (lower number = higher priority)
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority (both priority or both non-priority), sort alphabetically
    return a.symbol.localeCompare(b.symbol);
  });
}
