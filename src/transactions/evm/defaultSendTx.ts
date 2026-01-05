import { Config, sendTransaction } from '@wagmi/core';
import { Hex } from 'viem';

export async function defaultSendTx({ wagmiConfig, data, to }: { wagmiConfig?: Config; data: Hex; to: Hex }) {
  if (wagmiConfig) {
    return sendTransaction(wagmiConfig, {
      data,
      to,
    });
  }
  return undefined;
}
