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
        className="flex items-center justify-between w-full p-3 rounded-lg bg-[var(--tuwa-bg-secondary)] border border-[var(--tuwa-border-primary)] text-[var(--tuwa-text-primary)] cursor-pointer"
        aria-label="Select network"
      >
        <Select.Value>
          <div className="flex items-center gap-2">
            <Web3Icon chainId={selectedChainId} className="w-6 h-6" />
            <span>{selectedChain.name}</span>
          </div>
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon className="w-5 h-5" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-50 overflow-hidden bg-[var(--tuwa-bg-primary)] border border-[var(--tuwa-border-primary)] rounded-lg shadow-lg w-full"
          position="popper"
          sideOffset={5}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-[var(--tuwa-bg-primary)] cursor-pointer">
            <ChevronUpIcon className="w-4 h-4" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1 max-h-60">
            <Select.Group>
              {chains.map((chain) => (
                <Select.Item
                  key={chain.id}
                  value={chain.id.toString()}
                  className="flex items-center gap-2 w-full p-3 rounded-md outline-none cursor-pointer data-[highlighted]:bg-[var(--tuwa-bg-secondary)] data-[state=checked]:bg-[var(--tuwa-bg-secondary)]"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Web3Icon chainId={chain.id} className="w-6 h-6" />
                    <Select.ItemText>{chain.name}</Select.ItemText>
                  </div>
                  <Select.ItemIndicator>
                    <CheckIcon className="w-4 h-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-[var(--tuwa-bg-primary)] cursor-pointer">
            <ChevronDownIcon className="w-4 h-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
