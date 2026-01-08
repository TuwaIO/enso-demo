import { createDefaultTransports, impersonated, safeSdkOptions } from '@tuwaio/satellite-evm';
import { baseAccount, safe, walletConnect } from '@wagmi/connectors';
import { createConfig, injected } from '@wagmi/core';
import { arbitrum, avalanche, base, bsc, Chain, mainnet, optimism, polygon } from 'viem/chains';

export const appConfig = {
  appName: 'TUWA x ENSO Dapp',
  appDescription: 'TUWA x ENSO Demo App',
  projectId: process.env.NEXT_PUBLIC_WALLET_PROJECT_ID ?? '9077e559e63e099f496b921a027d0f04',
  appLogoUrl: 'https://raw.githubusercontent.com/TuwaIO/workflows/refs/heads/main/preview/preview-logo.png',
  appUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'https://enso-demo.tuwa.io/',
};

export const appEVMChains = [
  {
    ...mainnet,
    rpcUrls: {
      ...mainnet.rpcUrls,
      default: {
        http: ['https://eth-mainnet.g.alchemy.com/v2/L9Fokyp12OwHmVffqY0Kf'],
      },
    },
  },
  polygon,
  arbitrum,
  optimism,
  avalanche,
  base,
  bsc,
] as readonly [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  connectors: [
    injected(),
    baseAccount({
      appName: appConfig.appName,
      appLogoUrl: appConfig.appLogoUrl,
    }),
    safe({
      ...safeSdkOptions,
    }),
    walletConnect({
      projectId: appConfig.projectId,
      metadata: {
        name: appConfig.appName,
        description: appConfig.appDescription,
        url: appConfig.appUrl,
        icons: [appConfig.appLogoUrl],
      },
    }),
    impersonated({}),
  ],
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
  syncConnectedChain: true,
});
