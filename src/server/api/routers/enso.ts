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
        const balances = await ensoClient.getBalances({
          chainId,
          eoaAddress: address as Address,
          useEoa: true,
        });

        return balances;
      } catch (error) {
        console.error('Error fetching Enso balances:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallet balances from Enso API',
          cause: error,
        });
      }
    }),
});
