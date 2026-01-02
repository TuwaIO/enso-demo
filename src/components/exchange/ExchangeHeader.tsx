'use client';

import { ArrowLeftIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ExchangeHeaderProps {
  title: string;
  subtitle?: string;
}

export function ExchangeHeader({ title, subtitle = 'Powered by Enso Finance' }: ExchangeHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-[var(--tuwa-button-gradient-from)] to-[var(--tuwa-button-gradient-to)] p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 p-2 rounded-full bg-[var(--tuwa-bg-primary)]/20 hover:bg-[var(--tuwa-bg-primary)]/30 transition-colors"
          title="Back to Home"
        >
          <ArrowLeftIcon className="w-full h-full text-[var(--tuwa-bg-primary)]" />
        </button>
        <div className="w-10 h-10 p-2 rounded-full bg-[var(--tuwa-bg-primary)]/20">
          <ArrowsRightLeftIcon className="w-full h-full text-[var(--tuwa-bg-primary)]" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--tuwa-bg-primary)]">{title}</h1>
          <p className="text-[var(--tuwa-bg-primary)]/80 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
