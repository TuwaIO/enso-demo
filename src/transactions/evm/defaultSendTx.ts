import { Config, sendTransaction } from '@wagmi/core';

import { GenericTxAction } from '@/transactions';

export async function defaultSendTx({ wagmiConfig, ...props }: { wagmiConfig?: Config } & GenericTxAction) {
  if (!wagmiConfig) {
    return undefined;
  }

  try {
    const txParams: any = {
      data: props.data,
      to: props.to,
    };

    if (props.value) {
      txParams.value = BigInt(props.value);
    }

    return sendTransaction(wagmiConfig, {
      ...txParams,
    });
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    throw error;
  }
}
