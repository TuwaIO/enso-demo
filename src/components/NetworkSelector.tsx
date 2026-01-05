'use client';

import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import * as Select from '@radix-ui/react-select';
import { Chain } from 'viem/chains';

interface NetworkSelectorProps {
  chains: readonly Chain[];
  selectedChainId: number;
  onSelectChain: (chainId: number) => void;
}

export function NetworkSelector({ chains, selectedChainId, onSelectChain }: NetworkSelectorProps) {
  const selectedChain = chains.find((chain) => chain.id === selectedChainId) || chains[0];

  const handleValueChange = (value: string) => {
    onSelectChain(Number(value));
  };

  return (
    <Select.Root value={selectedChainId.toString()} onValueChange={handleValueChange}>
      <Select.Trigger
        className="group flex items-center justify-between w-full p-3 rounded-xl bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] cursor-pointer hover:border-[var(--tuwa-button-gradient-from)] hover:shadow-lg hover:shadow-[var(--tuwa-button-gradient-from)]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--tuwa-button-gradient-from)]/30 focus:border-[var(--tuwa-button-gradient-from)]"
        aria-label="Select network"
      >
        <Select.Value>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-7 h-7">
                <Web3Icon chainId={selectedChainId} className="rounded-full shadow-sm" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--tuwa-button-gradient-from)]/10 to-[var(--tuwa-button-gradient-to)]/10"></div>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-[var(--tuwa-text-primary)]">{selectedChain.name}</span>
              <span className="text-xs text-[var(--tuwa-text-secondary)] font-mono">Chain ID: {selectedChain.id}</span>
            </div>
          </div>
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon className="w-5 h-5 text-[var(--tuwa-text-secondary)] group-hover:text-[var(--tuwa-button-gradient-from)] transition-colors duration-200 group-data-[state=open]:rotate-180 transform transition-transform" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-[60] overflow-hidden bg-[var(--tuwa-bg-primary)] border border-[var(--tuwa-border-primary)] rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
          position="popper"
          sideOffset={8}
          style={{
            width: 'var(--radix-select-trigger-width)',
            maxHeight: 'var(--radix-select-content-available-height)',
          }}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-8 bg-[var(--tuwa-bg-primary)] cursor-pointer text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors border-b border-[var(--tuwa-border-primary)]">
            <ChevronUpIcon className="w-4 h-4" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-2 max-h-64">
            <Select.Group>
              {chains.map((chain) => (
                <Select.Item
                  key={chain.id}
                  value={chain.id.toString()}
                  className="group flex items-center gap-3 w-full p-3 rounded-lg outline-none cursor-pointer hover:bg-[var(--tuwa-bg-secondary)] data-[highlighted]:bg-[var(--tuwa-bg-secondary)] data-[state=checked]:bg-[var(--tuwa-bg-secondary)] data-[state=checked]:border data-[state=checked]:border-[var(--tuwa-button-gradient-from)]/30 transition-all duration-150"
                >
                  <Web3Icon chainId={chain.id} className="rounded-full shadow-sm shrink-0" />

                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <Select.ItemText className="font-semibold text-[var(--tuwa-text-primary)] group-data-[state=checked]:text-[var(--tuwa-button-gradient-from)] truncate">
                      {chain.name}
                    </Select.ItemText>
                    <span className="text-xs text-[var(--tuwa-text-secondary)] font-mono group-data-[state=checked]:text-[var(--tuwa-text-secondary)]">
                      Chain ID: {chain.id}
                    </span>
                  </div>

                  <Select.ItemIndicator className="flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-[var(--tuwa-button-gradient-from)] flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-8 bg-[var(--tuwa-bg-primary)] cursor-pointer text-[var(--tuwa-text-secondary)] hover:text-[var(--tuwa-text-primary)] transition-colors border-t border-[var(--tuwa-border-primary)]">
            <ChevronDownIcon className="w-4 h-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
