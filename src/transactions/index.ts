import { Transaction } from '@tuwaio/pulsar-core';
import { Hex } from 'viem';

import { wagmiConfig } from '@/configs/appConfig';
import { defaultSendTx } from '@/transactions/evm/defaultSendTx';

export type GenericTxAction = {
  data: Hex;
  to: Hex;
  value?: string;
  gas?: string;
};

// Transaction actions will be defined here
export const txActions = {
  approveENSOContact: ({ ...props }: GenericTxAction) => defaultSendTx({ wagmiConfig, ...props }),
  swapUsingENSOAPI: ({ ...props }: GenericTxAction) => defaultSendTx({ wagmiConfig, ...props }),
};

// Transaction types enum
export enum TxType {
  approveENSOContact = 'approveENSOContact',
  swapUsingENSOAPI = 'swapUsingENSOAPI',
}

type ApproveENSOContactTx = Transaction & {
  type: TxType.approveENSOContact;
  payload: {
    chainId: number;
    amountNative: string;
    amountUSD: string;
    tokenAddress: string;
    tokenSymbol: string;
  };
};

type SwapUsingENSOAPITX = Transaction & {
  type: TxType.swapUsingENSOAPI;
  payload: {
    chainIdFrom: number;
    chainIdTo: number;
    tokenAddressFrom: string;
    tokenSymbolFrom: string;
    tokenAddressTo: string;
    tokenSymbolTo: string;
    amountToNative: string;
    amountToUSD: string;
  };
};

// Transaction union type
export type TransactionUnion = ApproveENSOContactTx | SwapUsingENSOAPITX;
