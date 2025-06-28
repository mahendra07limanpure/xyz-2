import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { blockchainService } from '../../services/blockchainServiceFrontend';

interface LootItem {
  id: number;
  name: string;
  type: string;
  rarity: number;
  power: number;
  chainId: number;
}

interface CrossChainLootTransferProps {
  lootItems: LootItem[];
  onTransferComplete?: (txHash: string) => void;
}

const CrossChainLootTransfer: React.FC<CrossChainLootTransferProps> = ({
  lootItems,
  onTransferComplete
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedLoot, setSelectedLoot] = useState<LootItem | null>(null);
  const [destinationChain, setDestinationChain] = useState<number>(11155111);
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string>('');

  const chainNames = {
    11155111: 'Sepolia Testnet',
    80001: 'Polygon Mumbai',
    421613: 'Arbitrum Goerli',
  };

  const handleTransfer = async () => {
    if (!selectedLoot || !receiverAddress || !walletClient || !address) {
      setTransferStatus('Please fill all fields and connect wallet');
      return;
    }

    setIsTransferring(true);
    setTransferStatus('Initiating cross-chain transfer...');

    try {
      const destinationChainSelector = blockchainService.getChainSelector(destinationChain);
      
      const txHash = await blockchainService.sendLootCrossChain(
        walletClient,
        selectedLoot.chainId,
        destinationChainSelector,
        receiverAddress,
        selectedLoot.id
      );

      setTransferStatus(`Transfer initiated! TX: ${txHash.slice(0, 8)}...`);
      onTransferComplete?.(txHash);
      
      // Reset form
      setSelectedLoot(null);
      setReceiverAddress('');
    } catch (error) {
      console.error('Cross-chain transfer failed:', error);
      setTransferStatus(`Transfer failed: ${error.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="glass-morphism p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">🌐 Cross-Chain Loot Transfer</h3>
      
      <div className="space-y-4">
        {/* Loot Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Loot Item
          </label>
          <select
            value={selectedLoot?.id || ''}
            onChange={(e) => {
              const loot = lootItems.find(item => item.id === Number(e.target.value));
              setSelectedLoot(loot || null);
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Choose a loot item...</option>
            {lootItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} (Power: {item.power}, Chain: {chainNames[item.chainId] || item.chainId})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Chain */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination Chain
          </label>
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value={11155111}>Sepolia Testnet</option>
            <option value={80001}>Polygon Mumbai</option>
            <option value={421613}>Arbitrum Goerli</option>
          </select>
        </div>

        {/* Receiver Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Receiver Address
          </label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={isTransferring || !selectedLoot || !receiverAddress}
          className="w-full game-button py-3 disabled:opacity-50"
        >
          {isTransferring ? 'Transferring...' : 'Transfer Cross-Chain'}
        </button>

        {/* Status */}
        {transferStatus && (
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-300">{transferStatus}</p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Cross-chain transfers use Chainlink CCIP</p>
          <p>• Loot will be burned on source chain and minted on destination</p>
          <p>• Transfer fees are paid in LINK tokens</p>
          <p>• Transfers may take a few minutes to complete</p>
        </div>
      </div>
    </div>
  );
};

export default CrossChainLootTransfer;
