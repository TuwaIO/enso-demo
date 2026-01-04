'use client';

import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Hop } from '@/server/api/types/enso';

interface RouteDetailsProps {
  route?: Hop[];
}

export function RouteDetails({ route }: RouteDetailsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!route || route.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors mb-2 focus:outline-none"
      >
        <span>{isOpen ? 'Hide route' : 'Show route'}</span>
        {isOpen ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />}
      </button>

      {isOpen && (
        <div className="p-3 rounded-lg border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-secondary)] overflow-x-auto">
          <div className="flex items-center min-w-max">
            {route.map((hop, index) => (
              <div key={index} className="flex items-center">
                {/* Step Card */}
                <div className="flex flex-col items-center justify-center bg-[var(--tuwa-bg-primary)] border border-[var(--tuwa-border-secondary)] rounded-lg p-2 min-w-[100px] shadow-sm">
                  <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-semibold mb-1">
                    {hop.protocol}
                  </div>
                  <div className="text-xs text-[var(--tuwa-text-secondary)] font-medium capitalize">
                    {hop.action}
                  </div>
                </div>

                {/* Arrow Connector (if not last item) */}
                {index < route.length - 1 && (
                  <div className="mx-2 text-[var(--tuwa-text-tertiary)] bg-[var(--tuwa-bg-muted)] rounded-full p-1">
                    <ChevronRightIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
