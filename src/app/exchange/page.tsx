import { Metadata } from 'next';
import { Suspense } from 'react';

import ExchangePage from '@/components/ExchangePage';
import { TuwaLoader } from '@/components/TuwaLoader';

export const metadata: Metadata = {
  title: 'Token Exchange | TUWA x Enso',
  description: 'Exchange tokens seamlessly with optimal routing powered by Enso Finance.',
};

export default function Exchange() {
  return (
    <Suspense fallback={<TuwaLoader />}>
      <ExchangePage />
    </Suspense>
  );
}
