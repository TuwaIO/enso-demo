'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/configs/appConfig';
import { SatelliteConnectProviders } from '@/providers/SatelliteConnectProviders';
import { TRPCReactProvider } from '@/providers/TRPCReactProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <TRPCReactProvider>
        <SatelliteConnectProviders>{children}</SatelliteConnectProviders>
      </TRPCReactProvider>
    </WagmiProvider>
  );
}
