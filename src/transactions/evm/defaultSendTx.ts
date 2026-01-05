import { Config, sendTransaction } from '@wagmi/core';

import { GenericTxAction } from '@/transactions';

export async function defaultSendTx({ wagmiConfig, ...props }: { wagmiConfig?: Config } & GenericTxAction) {
  if (wagmiConfig) {
    if (props.value && props.gas) {
      return sendTransaction(wagmiConfig, {
        data: props.data,
        to: props.to,
        value: BigInt(props.value),
        gas: BigInt(props.gas),
      });
    } else if (props.value) {
      return sendTransaction(wagmiConfig, {
        data: props.data,
        to: props.to,
        value: BigInt(props.value),
      });
    } else if (props.gas) {
      return sendTransaction(wagmiConfig, {
        data: props.data,
        to: props.to,
        gas: BigInt(props.gas),
      });
    }
    return sendTransaction(wagmiConfig, {
      data: props.data,
      to: props.to,
    });
  }
  return undefined;
}
