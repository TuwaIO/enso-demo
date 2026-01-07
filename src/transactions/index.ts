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
  exchangeUsingENSOAPI = 'exchangeUsingENSOAPI',
}

export type ApproveENSOContactTx = Transaction & {
  type: TxType.approveENSOContact;
  payload: {
    chainId: number;
    amountNative: string;
    amountUSD: string;
    tokenAddress: string;
    tokenSymbol: string;
  };
};

export type ExchangeUsingENSOAPITX = Transaction & {
  type: TxType.exchangeUsingENSOAPI;
  payload: {
    chainIdFrom: number;
    chainIdTo: number;
    tokenAddressFrom: string;
    tokenSymbolFrom: string;
    tokenAddressTo: string;
    tokenSymbolTo: string;
    fromAmount: string;
    toAmount: string;
  };
};

// Transaction union type
export type TransactionUnion = ApproveENSOContactTx | ExchangeUsingENSOAPITX;
