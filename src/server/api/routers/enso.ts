import 'server-only';

import { EnsoClient } from '@ensofinance/sdk';
import { TRPCError } from '@trpc/server';
import { Address } from 'viem';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// Initialize Enso client with API key from environment
const ensoClient = new EnsoClient({
  apiKey: process.env.ENSO_API_KEY ?? '',
});

// Define the balance item type based on your API response
type BalanceItem = {
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
 * Filter function to identify legitimate tokens and filter out scam/spam tokens
 */
function filterLegitimateTokens(balances: BalanceItem[]): BalanceItem[] {
  // Known scam patterns in symbols and names
  const scamPatterns = [
    // Website URLs and claim patterns
    /visit.*to\s*claim/i,
    /claim.*reward/i,
    /https?:\/\//i,
    /www\./i,
    /\.com/i,
    /\.org/i,
    /\.net/i,
    /\.io/i,
    /\.xyz/i,
    /\.gift/i,

    // Scam phrases
    /for\s*free/i,
    /bonus/i,
    /\$.*claim/i,
    /visit.*website/i,
    /special.*reward/i,
    /\d+\$.*visit/i,
    /claim.*at/i,

    // Suspicious symbols
    /^\$\s/,
    /^#\s/,
    /^!\s/,
    /^\+\s/,
    /\[.*\]/,
  ];

  return balances.filter((token) => {
    // Calculate actual balance
    const balance = Number(token.amount) / Math.pow(10, token.decimals);
    const usdValue = balance * token.price;

    // Filter 1: STRICT PRICE CHECK - Must have price > 0
    if (token.price <= 0) {
      console.log(`Filtering out token ${token.symbol} - price: ${token.price}`);
      return false;
    }

    // Filter 2: Must have meaningful balance (not zero or extremely tiny)
    if (balance <= 0) {
      console.log(`Filtering out token ${token.symbol} - zero balance`);
      return false;
    }

    // Filter 3: Check for scam patterns in symbol
    const hasScamPatternInSymbol = scamPatterns.some((pattern) => pattern.test(token.symbol));
    if (hasScamPatternInSymbol) {
      console.log(`Filtering out token ${token.symbol} - scam pattern in symbol`);
      return false;
    }

    // Filter 4: Check for scam patterns in name
    const hasScamPatternInName = scamPatterns.some((pattern) => pattern.test(token.name));
    if (hasScamPatternInName) {
      console.log(`Filtering out token ${token.symbol} - scam pattern in name`);
      return false;
    }

    // Filter 5: Symbol length check (most legitimate tokens have reasonable symbol length)
    if (token.symbol.length > 25) {
      console.log(`Filtering out token ${token.symbol} - symbol too long`);
      return false;
    }

    // Filter 6: Name length check (avoid extremely long promotional names)
    if (token.name.length > 60) {
      console.log(`Filtering out token ${token.symbol} - name too long`);
      return false;
    }

    // Filter 7: Check for suspicious balance amounts (extremely large balances often indicate airdrops/scams)
    if (balance > 1e12) {
      console.log(`Filtering out token ${token.symbol} - suspicious large balance: ${balance}`);
      return false;
    }

    // Filter 8: Check if symbol contains only special characters or numbers
    if (/^[\d\s$#!+\-.()[\]]+$/.test(token.symbol)) {
      console.log(`Filtering out token ${token.symbol} - only special characters/numbers`);
      return false;
    }

    // Filter 9: Skip tokens with extremely small USD value (< $0.01)
    if (usdValue < 0.01) {
      console.log(`Filtering out token ${token.symbol} - USD value too small: $${usdValue.toFixed(6)}`);
      return false;
    }

    // Filter 10: Check for common spam token patterns
    const spamSymbolPatterns = [
      /^[A-Z]+\d+[A-Z]*$/, // Like "ABC123DEF"
      /^\d+[A-Z]+$/, // Like "123ABC"
      /^[A-Z]{1}[a-z]+\.[a-z]+$/, // Like "A68.net"
    ];

    const hasSpamPattern = spamSymbolPatterns.some((pattern) => pattern.test(token.symbol));
    if (hasSpamPattern) {
      console.log(`Filtering out token ${token.symbol} - spam pattern detected`);
      return false;
    }

    console.log(
      `✅ Keeping token ${token.symbol} - price: $${token.price}, balance: ${balance}, USD: $${usdValue.toFixed(2)}`,
    );
    return true;
  });
}

/**
 * Additional quality score calculation for better sorting
 */
function calculateTokenQuality(token: BalanceItem & { formattedBalance: number; usdValue: number }): number {
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
 */
function sortTokensByValue(
  balances: (BalanceItem & { formattedBalance: number; usdValue: number })[],
): typeof balances {
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

export const ensoRouter = createTRPCRouter({
  /**
   * Get wallet balances for a given address and chain
   */
  getWalletBalances: publicProcedure
    .input(
      z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
        chainId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { address, chainId } = input;

        // Fetch balances from Enso SDK
        const rawBalances = (await ensoClient.getBalances({
          chainId,
          eoaAddress: address as Address,
          useEoa: true,
        })) as BalanceItem[];

        console.log(`\n🔍 Processing ${rawBalances.length} tokens from Enso API...`);

        // Filter out scam/spam tokens and keep only legitimate ones
        const legitimateTokens = filterLegitimateTokens(rawBalances);

        // Add computed fields for easier frontend usage
        const enrichedTokens = legitimateTokens.map((token) => {
          const balance = Number(token.amount) / Math.pow(10, token.decimals);
          const usdValue = balance * token.price;

          return {
            ...token,
            formattedBalance: balance,
            usdValue,
            formattedUsdValue: usdValue > 0 ? `$${usdValue.toFixed(2)}` : '',
          };
        });

        // Sort tokens by quality and value
        const sortedTokens = sortTokensByValue(enrichedTokens);

        console.log(`\n✅ Filtered ${rawBalances.length} tokens down to ${sortedTokens.length} legitimate tokens`);

        // Log some stats for debugging
        const withPrice = sortedTokens.filter((t) => t.price > 0).length;
        const withValue = sortedTokens.filter((t) => t.usdValue > 0).length;
        const totalValue = sortedTokens.reduce((sum, t) => sum + t.usdValue, 0);

        console.log(`- ${withPrice} tokens with price > 0`);
        console.log(`- ${withValue} tokens with USD value > 0`);
        console.log(`- Total portfolio value: $${totalValue.toFixed(2)}`);

        return sortedTokens;
      } catch (error) {
        console.error('Error fetching Enso balances:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallet balances from Enso API',
          cause: error,
        });
      }
    }),

  /**
   * Get raw wallet balances (unfiltered) - useful for debugging
   */
  getRawWalletBalances: publicProcedure
    .input(
      z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
        chainId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { address, chainId } = input;

        const balances = await ensoClient.getBalances({
          chainId,
          eoaAddress: address as Address,
          useEoa: true,
        });

        return balances;
      } catch (error) {
        console.error('Error fetching raw Enso balances:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch raw wallet balances from Enso API',
          cause: error,
        });
      }
    }),
});
