import 'server-only';

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

import { getOptimalRoute, getTokens, getWalletBalances } from '../utils/ensoClient';
import { enrichTokens, logPortfolioStats } from '../utils/tokenEnrichment';
import { filterLegitimateTokens } from '../utils/tokenFilters';
import { sortTokensByValue } from '../utils/tokenQuality';

export const ensoRouter = createTRPCRouter({
  /**
   * Get optimal route between two tokens using Enso SDK
   */
  getOptimalRoute: publicProcedure
    .input(
      z.object({
        fromToken: z.string(),
        toToken: z.string(),
        amount: z.string(),
        chainId: z.number().int().positive(),
        slippage: z.number().min(0.1).max(50).default(0.5), // Percentage, e.g. 0.5%
        fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'), // Required for SDK route calculation
        receiver: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // Use the utility function to get the optimal route
      return getOptimalRoute(input);
    }),

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
        const rawBalances = await getWalletBalances(address, chainId);

        console.log(`\n🔍 Processing ${rawBalances.length} tokens from Enso API...`);

        // Filter out scam/spam tokens and keep only legitimate ones
        const legitimateTokens = filterLegitimateTokens(rawBalances);

        // Add computed fields for easier frontend usage
        const enrichedTokens = enrichTokens(legitimateTokens);

        // Sort tokens by quality and value
        const sortedTokens = sortTokensByValue(enrichedTokens);

        // Log portfolio statistics
        logPortfolioStats(rawBalances.length, sortedTokens);

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
      // Use the utility function to get wallet balances
      return getWalletBalances(input.address, input.chainId);
    }),

  /**
   * Get list of tokens for a given chain
   */
  getTokensList: publicProcedure
    .input(
      z.object({
        chainId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { chainId } = input;
        return await getTokens(chainId);
      } catch (error) {
        console.error('Error in getTokens tRPC handler:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tokens',
          cause: error,
        });
      }
    }),
});
