import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { TokenData } from '@ensofinance/sdk';
import { useState } from 'react';

import { DisplayToken, SortedBalanceItem } from '@/server/api/types/enso';

interface TokenWithNetworkBadgeProps {
  token: SortedBalanceItem | DisplayToken | TokenData;
  size?: 'sm' | 'md' | 'lg';
  showNetworkBadge?: boolean;
}

export function TokenWithNetworkBadge({ token, size = 'md', showNetworkBadge = true }: TokenWithNetworkBadgeProps) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const badgeSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const hasLogoUri = 'logoUri' in token && token.logoUri && token.logoUri !== null;
  const hasLogosUri = 'logosUri' in token && token.logosUri && token.logosUri !== null && token.logosUri[0];
  const shouldShowImage = (hasLogoUri || hasLogosUri) && !isError;

  // Get logo URI with proper type checking
  const logoUri = hasLogoUri ? token.logoUri : hasLogosUri && token.logosUri ? token.logosUri[0] : null;

  return (
    <>
      <div className="flex items-center justify-center w-full h-full rounded-full overflow-hidden bg-[var(--tuwa-bg-muted)] relative">
        {/* Loading skeleton */}
        {isLoading && shouldShowImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--tuwa-bg-muted)] animate-pulse">
            <div className="w-1/2 h-1/2 rounded-full bg-[var(--tuwa-bg-secondary)]" />
          </div>
        )}

        {/* Token Image */}
        {shouldShowImage && logoUri ? (
          <img
            src={logoUri}
            alt={token.symbol ?? ''}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsError(true);
              setIsLoading(false);
            }}
            className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <Web3Icon symbol={token.symbol ?? ''} className="w-full h-full" />
        )}
      </div>

      {/* Network Badge */}
      {showNetworkBadge && (
        <div
          className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} rounded-full border-2 border-[var(--tuwa-bg-secondary)] overflow-hidden bg-[var(--tuwa-bg-primary)] flex items-center justify-center`}
        >
          <Web3Icon chainId={token.chainId} className="w-full h-full" />
        </div>
      )}
    </>
  );
}
