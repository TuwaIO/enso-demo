import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { TokenData } from '@ensofinance/sdk';

import { DisplayToken, SortedBalanceItem } from '@/server/api/types/enso';

interface TokenWithNetworkBadgeProps {
  token: SortedBalanceItem | DisplayToken | TokenData;
  size?: 'sm' | 'md' | 'lg';
  showNetworkBadge?: boolean;
}

export function TokenWithNetworkBadge({ token, size = 'md', showNetworkBadge = true }: TokenWithNetworkBadgeProps) {
  const badgeSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <>
      <div className="flex items-center justify-center w-full h-full rounded-full overflow-hidden bg-[var(--tuwa-bg-muted)]">
        {'logoUri' in token && token.logoUri ? (
          <img src={token.logoUri} alt={token.symbol} className="w-full h-full object-cover" />
        ) : 'logosUri' in token && token.logosUri && token.logosUri[0] ? (
          <img src={token.logosUri[0]} alt={token.symbol ?? ''} className="w-full h-full object-cover" />
        ) : (
          <Web3Icon symbol={token.symbol ?? ''} className="w-full h-full" />
        )}
      </div>
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
