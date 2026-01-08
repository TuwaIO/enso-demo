import 'server-only';

import { EnsoClient } from '@ensofinance/sdk';
import { TRPCError } from '@trpc/server';
import { createViemClient } from '@tuwaio/orbit-evm';
import { Address, erc20Abi, formatUnits } from 'viem';

import { appEVMChains } from '@/configs/appConfig';
import { sortTokensByPriority } from '@/server/api/utils/priorityTokens';

import { BalanceItem, TokenItem } from '../types/enso';

// Initialize Enso client with API key from environment
export const ensoClient = new EnsoClient({
  apiKey: process.env.ENSO_API_KEY ?? '',
});

/**
 * Get token balances for a wallet address
 *
 * @param address - Wallet address (0x format)
 * @param chainId - Chain ID (e.g., 1 for Ethereum mainnet)
 * @returns Promise<BalanceItem[]> Array of token balances
 * @throws {TRPCError} When API call fails
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
 * Get list of tokens from Enso API
 *
 * @param chainId - Chain ID to fetch tokens for
 * @returns Promise<TokenItem[]> Array of token items sorted by priority
 * @throws {TRPCError} When API call fails or ENSO_API_KEY is missing
 */
export async function getTokens(chainId: number): Promise<TokenItem[]> {
  try {
    const apiKey = process.env.ENSO_API_KEY;
    if (!apiKey) {
      throw new Error('ENSO_API_KEY is not configured');
    }

    // Call the Enso API to get tokens
    // Using the endpoint: https://docs.enso.build/api-reference/tokens/tokens
    const response = await fetch(
      `https://api.enso.build/api/v1/tokens?pageSize=1000&includeUnderlying=true&chainId=${chainId}&includeMetadata=true&type=base`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Enso API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch tokens: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // The API returns an array of tokens directly
    const rawTokens = Array.isArray(data) ? data : data.data || [];

    // Filter tokens: exclude tokens without logos and tokens with "v1" in name
    const filteredTokens = rawTokens.filter((token: any) => {
      // Must have at least one logo
      const hasLogo = token.logosUri && Array.isArray(token.logosUri) && token.logosUri.length > 0;
      // Must not contain "v1" in name (case insensitive)
      const hasV1InName = token.name && token.name.toLowerCase().includes('v1');
      return hasLogo && !hasV1InName;
    });

    return sortTokensByPriority(filteredTokens as TokenItem[]);
  } catch (error) {
    console.error('Error fetching tokens from Enso API:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch tokens from Enso API',
      cause: error,
    });
  }
}

/**
 * Get optimal route between two tokens using Enso SDK
 *
 * @param params - Route parameters
 * @param params.fromToken - Source token address
 * @param params.toToken - Destination token address
 * @param params.amount - Amount to swap (in wei/smallest unit)
 * @param params.chainId - Source chain ID
 * @param params.slippage - Slippage tolerance (percentage, e.g., 0.5 for 0.5%)
 * @param params.fromAddress - User wallet address
 * @param params.receiver - Optional recipient address (defaults to fromAddress)
 * @param params.destinationChainId - Optional destination chain ID for cross-chain swaps
 * @returns Promise<RouteResponse> Optimal route data with transaction info
 * @throws {TRPCError} When no route found or API call fails
 */
export async function getOptimalRoute(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  slippage: number;
  fromAddress: string;
  receiver?: string;
  destinationChainId?: number;
}) {
  try {
    const { fromToken, toToken, amount, chainId, slippage, fromAddress, receiver, destinationChainId } = params;

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
      destinationChainId: destinationChainId || chainId,
      fromAddress: fromAddress as Address,
      receiver: (receiver as Address) ?? (fromAddress as Address),
      spender: fromAddress as Address,
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

    const nativeCurrency = await ensoClient.getPriceData({
      chainId,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    });

    const tokenOutPrice = await ensoClient.getPriceData({
      chainId: destinationChainId || chainId,
      address: toToken as Address,
    });

    const updatedRoutes = await Promise.all(
      routeResponse.route.map(async (step) => {
        const tokensInWithData = await Promise.all(
          step.tokenIn.map(async (token) => {
            const tokenData = await ensoClient.getTokenData({
              chainId: step.chainId ?? step.sourceChainId,
              address: token as Address,
              includeMetadata: true,
            });
            return tokenData.data[0];
          }),
        );

        const tokensOutWithData = await Promise.all(
          step.tokenOut.map(async (token) => {
            const tokenData = await ensoClient.getTokenData({
              chainId: step.destinationChainId ?? step.chainId ?? step.sourceChainId,
              address: token as Address,
              includeMetadata: true,
            });
            return tokenData.data[0];
          }),
        );
        return {
          ...step,
          tokenIn: tokensInWithData,
          tokenOut: tokensOutWithData,
        };
      }),
    );

    // Return data in a format convenient for the frontend
    return {
      fromToken,
      toToken,
      fromAmount: amount,
      // @ts-expect-error - minAmountOut is not defined in the SDK type definitions but is returned by the API
      minAmountOut: formatUnits(BigInt(routeResponse.minAmountOut), tokenOutPrice.decimals),
      priceImpact: routeResponse.priceImpact,
      toAmount: routeResponse.amountOut,
      route: updatedRoutes, // Route for displaying steps
      tx: routeResponse.tx, // Transaction data
      createdAt: routeResponse.createdAt,
      nativeCurrency,
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

/**
 * Check if token approval is required and get approval transaction data
 *
 * @param chainId - Chain ID where the token exists
 * @param fromAddress - User wallet address that owns the tokens
 * @param tokenAddress - ERC20 token contract address to check approval for
 * @param amount - Amount to be spent (in wei/smallest unit)
 * @returns Promise<ApprovalData | undefined> Approval transaction data if approval needed, undefined if sufficient allowance
 * @throws {TRPCError} When API call fails or viem client operations fail
 *
 * @example
 * ```typescript
 * const approvalData = await getApprovalData(1, userAddress, tokenAddress, amountInWei);
 * if (approvalData) {
 *   // User needs to approve token spending first
 *   console.log('Approval required:', approvalData);
 * } else {
 *   // User has sufficient allowance, can proceed with swap
 *   console.log('No approval needed');
 * }
 * ```
 */
export async function getApprovalData(chainId: number, fromAddress: string, tokenAddress: string, amount: string) {
  try {
    // 🏗️ Get approval transaction data from Enso SDK
    const approvalData = await ensoClient.getApprovalData({
      chainId,
      fromAddress: fromAddress as Address,
      tokenAddress: tokenAddress as Address,
      amount: amount,
    });

    // 🔧 Create Viem client for blockchain interactions
    const viemClient = createViemClient(chainId, appEVMChains);
    if (!viemClient) {
      throw new Error(`Failed to create Viem client for chain ${chainId}`);
    }

    // 🔍 Check current token allowance using Viem's readContract
    const allowance = await viemClient.readContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [fromAddress as Address, approvalData.spender as Address],
    });

    // 🔢 Compare current allowance with required amount
    const requiredAmount = BigInt(amount);
    const currentAllowance = allowance as bigint;

    // ✅ Return approval data only if more allowance is needed
    if (currentAllowance < requiredAmount) {
      console.log('📝 Approval required - returning approval transaction data');
      return approvalData;
    }

    // 🎯 Sufficient allowance - no approval needed
    console.log('✨ Sufficient allowance - no approval needed');
    return null;
  } catch (error) {
    console.error('❌ Error fetching Enso Approval data:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch approval data from Enso API',
      cause: error,
    });
  }
}

/**
 * Get token price data from Enso SDK
 *
 * @param chainId - Chain ID where the token exists
 * @param address - Token address
 * @returns Promise<Number> Token price in USD
 */
export async function getTokenPrice(chainId: number, address: string): Promise<number> {
  try {
    const priceData = await ensoClient.getPriceData({
      chainId,
      address: address as Address,
    });

    return Number(priceData.price);
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}
