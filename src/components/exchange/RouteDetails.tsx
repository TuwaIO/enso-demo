import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
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

  // Helper to render a token node
  const renderTokenNode = (token: Hop['tokenIn'][0]) => {
    return (
      <div className="flex flex-col items-center justify-center relative group shrink-0 select-none">
        {/* Icon Container */}
        <motion.div
          className="relative w-9 h-9"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Main Token Icon */}
          <div className="w-full h-full rounded-full overflow-hidden bg-[var(--tuwa-bg-muted)] border border-[var(--tuwa-border-secondary)] shadow-sm">
            {token.logosUri?.[0] ? (
              <img src={token.logosUri[0]} alt={token.symbol} className="w-full h-full object-cover" />
            ) : (
              <Web3Icon symbol={token.symbol} className="w-full h-full" />
            )}
          </div>
          {/* Chain Badge */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--tuwa-bg-secondary)] overflow-hidden bg-[var(--tuwa-bg-primary)] flex items-center justify-center z-10">
            <Web3Icon chainId={token.chainId} className="w-full h-full" />
          </div>
        </motion.div>
      </div>
    );
  };

  // 🏹 Arrow flow animation variants
  const arrowFlowVariants = {
    initial: { x: 0, opacity: 1 },
    animate: {
      x: [0, 4, -4, 0],
      opacity: [1, 0, 0, 1],
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center text-sm font-medium text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors mb-2 focus:outline-none"
      >
        <span>{isOpen ? 'Hide route' : 'Show route'}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        {isOpen && (
          <div className="p-4 rounded-xl border border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-secondary)] overflow-x-auto transition-all duration-300 hover:shadow-lg hover:border-[var(--tuwa-border-primary)]/80">
            <div className="flex items-center gap-2 min-w-max px-2">
              {/* Start Node */}
              {route[0]?.tokenIn?.[0] && renderTokenNode(route[0].tokenIn[0])}

              {/* Hops */}
              {route.map((hop, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 group/action cursor-default"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Action Arrow & Label */}
                  <div className="flex flex-col items-center px-1">
                    {/* Protocol Badge */}
                    <motion.div
                      className={`
                        px-2 py-0.5 rounded-lg text-[10px] font-bold mb-1
                        transition-colors duration-200
                        ${hop.protocol.includes('enso') || hop.protocol.includes('aave') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : ''}
                        ${hop.protocol.includes('stargate') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200' : ''}
                        ${!hop.protocol.includes('enso') && !hop.protocol.includes('stargate') && !hop.protocol.includes('aave') ? 'bg-[var(--tuwa-bg-muted)] text-[var(--tuwa-text-secondary)] border border-[var(--tuwa-border-primary)]' : ''}
                      `}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {hop.protocol}
                    </motion.div>

                    <div className="text-[10px] font-medium text-[var(--tuwa-text-secondary)] mb-1 capitalize">
                      {hop.action}
                    </div>

                    <motion.div
                      className="text-[var(--tuwa-text-muted)] group-hover/action:text-[var(--tuwa-text-primary)] transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        className="bg-[var(--tuwa-bg-muted)]/50 rounded-full p-0.5 group-hover/action:bg-[var(--tuwa-bg-muted)] transition-colors"
                        whileHover={{ backgroundColor: 'var(--tuwa-bg-muted)' }}
                      >
                        <motion.div variants={arrowFlowVariants} initial="initial" whileHover="animate">
                          <ChevronRightIcon className="w-3 h-3" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Destination Token for this hop */}
                  {hop.tokenOut?.[0] && renderTokenNode(hop.tokenOut[0])}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
