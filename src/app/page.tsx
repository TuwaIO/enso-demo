import { Metadata } from 'next';

import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'TUWA x Enso | Wallet Assets Dashboard',
  description:
    'View and manage your cryptocurrency portfolio with real-time asset tracking powered by TUWA SDK and Enso Finance API. Connect your wallet to see balances, prices, and portfolio value.',
};

export default function Home() {
  return <HomePage />;
}
