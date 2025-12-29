import 'server-only';

import { EnsoClient } from '@ensofinance/sdk';
import { TRPCError } from '@trpc/server';
import { Address } from 'viem';

import { BalanceItem } from '../types/enso';

// Initialize Enso client with API key from environment
export const ensoClient = new EnsoClient({
  apiKey: process.env.ENSO_API_KEY ?? '',
});

/**
 * Get token balances for a wallet address
 *
 * @param address Wallet address
 * @param chainId Chain ID
 * @returns Array of token balances
 */
export async function getWalletBalances(address: string, chainId: number): Promise<BalanceItem[]> {
  try {
    return (await ensoClient.getBalances({
      chainId,
      eoaAddress: address as Address,
      useEoa: true,
    })) as BalanceItem[];
  } catch (error) {
    console.error('Error fetching Enso balances:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch wallet balances from Enso API',
      cause: error,
    });
  }
}

/**
 * Get optimal route between two tokens
 *
 * @param params Route parameters
 * @returns Route data
 */
export async function getOptimalRoute(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  slippage: number;
  fromAddress: string;
  receiver?: string;
}) {
  try {
    const { fromToken, toToken, amount, chainId, slippage, fromAddress, receiver } = params;

    // Convert slippage to basis points (1% = 100 bps)
    const slippageBps = Math.floor(slippage * 100);

    // Call routing method through SDK
    // Note: Using getRouteData (or route depending on SDK version),
    // passing parameters corresponding to API /api/v1/shortcuts/route
    const routeResponse = await ensoClient.getRouteData({
      chainId,
      amountIn: [amount],
      tokenIn: [fromToken as Address],
      tokenOut: [toToken as Address],
      fromAddress: fromAddress as Address,
      receiver: (receiver as Address) ?? (fromAddress as Address),
      spender: fromAddress as Address, // User needs to approve the router
      routingStrategy: 'router',
      slippage: slippageBps.toString(),
    });

    // Handle case where SDK returns undefined or error
    if (!routeResponse) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No route found for this pair',
      });
    }

    // Return data in a format convenient for the frontend
    return {
      fromToken,
      toToken,
      fromAmount: amount,
      // SDK may return amountOut as string or array, take first value
      toAmount: Array.isArray(routeResponse.amountOut) ? routeResponse.amountOut[0] : routeResponse.amountOut,
      route: routeResponse.route, // Route for displaying steps
      tx: routeResponse.tx, // Transaction data
      gas: routeResponse.gas, // Gas estimate
      createdAt: routeResponse.createdAt,
    };
  } catch (error) {
    console.error('Error fetching optimal route from Enso SDK:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch optimal route from Enso SDK',
      cause: error,
    });
  }
}
