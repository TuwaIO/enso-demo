import ExchangePage from '@/components/ExchangePage';
import { Suspense } from 'react';

export default function Exchange() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExchangePage />
    </Suspense>
  );
}
