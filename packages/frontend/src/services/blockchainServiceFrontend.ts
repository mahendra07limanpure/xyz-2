import { type WalletClient } from 'viem';
import { sepolia, polygonMumbai } from 'viem/chains';
import { CONTRACT_ADDRESSES } from '../utils/contractAddresses';

import PartyRegistryJson from '../abi/PartyRegistry.json';
import LootManagerJson from '../abi/LootManager.json';
import CrossChainLootManagerJson from '../../../shared/src/abi/CrossChainLootManager.json';

const partyRegistryAbi = PartyRegistryJson as any;
const lootManagerAbi = LootManagerJson as any;
const crossChainLootManagerAbi = CrossChainLootManagerJson as any;

const CHAINS = {
  11155111: sepolia,
  80001: polygonMumbai,
} as const;

export class BlockchainService {
  private getContractAbi(name: 'LootManager' | 'PartyRegistry' | 'CrossChainLootManager') {
    if (name === 'LootManager') return lootManagerAbi;
    if (name === 'PartyRegistry') return partyRegistryAbi;
    if (name === 'CrossChainLootManager') return crossChainLootManagerAbi;
    throw new Error(`Unknown ABI: ${name}`);
  }

  private getContractAddress(chainId: number, contract: keyof typeof CONTRACT_ADDRESSES[11155111]) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    if (!addresses) throw new Error(`No addresses for chain ${chainId}`);
    return addresses[contract];
  }

  // Note: For read operations, use useReadContract hook directly in components
  // This service is mainly for write operations now

  // WRITE: create party
  async createParty(
    walletClient: WalletClient,
    chainId: number,
    maxSize: number
  ): Promise<{ transactionHash: string }> {
    const address = walletClient.account?.address;
    if (!address) throw new Error('Wallet not connected');

    const hash = await walletClient.writeContract({
      address: this.getContractAddress(chainId, 'partyRegistry'),
      abi: partyRegistryAbi,
      functionName: 'createParty',
      args: [BigInt(maxSize)],
      chain: CHAINS[chainId as keyof typeof CHAINS],
      account: address,
    });

    return { transactionHash: hash };
  }

  async registerPlayer(walletClient: WalletClient, chainId: number): Promise<string> {
    const address = walletClient.account?.address;
    if (!address) throw new Error('Wallet not connected');

    const hash = await walletClient.writeContract({
      address: this.getContractAddress(chainId, 'partyRegistry'),
      abi: partyRegistryAbi,
      functionName: 'registerPlayer',
      args: [],
      chain: CHAINS[chainId as keyof typeof CHAINS],
      account: address,
    });

    return hash;
  }

  async mintLoot(
    walletClient: WalletClient,
    chainId: number,
    playerAddress: string,
    name: string,
    lootType: string,
    rarity: number,
    power: number,
    attributes: string[]
  ): Promise<string> {
    const address = walletClient.account?.address;
    if (!address) throw new Error('Wallet not connected');

    const hash = await walletClient.writeContract({
      address: this.getContractAddress(chainId, 'lootManager'),
      abi: lootManagerAbi,
      functionName: 'mintLoot',
      args: [
        playerAddress,
        name,
        lootType,
        BigInt(rarity),
        BigInt(power),
        attributes,
      ],
      chain: CHAINS[chainId as keyof typeof CHAINS],
      account: address,
    });

    return hash;
  }

  // CROSS-CHAIN LOOT MANAGER METHODS
  async sendLootCrossChain(
    walletClient: WalletClient,
    chainId: number,
    destinationChainSelector: bigint,
    receiverAddress: string,
    lootId: number
  ): Promise<string> {
    const address = walletClient.account?.address;
    if (!address) throw new Error('Wallet not connected');

    const hash = await walletClient.writeContract({
      address: this.getContractAddress(chainId, 'crossChainLootManager'),
      abi: crossChainLootManagerAbi,
      functionName: 'sendLootCrossChain',
      args: [
        destinationChainSelector,
        receiverAddress,
        BigInt(lootId),
      ],
      chain: CHAINS[chainId as keyof typeof CHAINS],
      account: address,
    });

    return hash;
  }

  async getCrossChainFee(
    chainId: number,
    destinationChainSelector: bigint,
    receiverAddress: string,
    lootData: any
  ): Promise<bigint> {
    // Note: This would typically be a read operation using useReadContract hook
    // but including here for completeness
    throw new Error('Use useReadContract hook for fee estimation');
  }

  // Helper method to get chain selector for cross-chain operations
  getChainSelector(chainId: number): bigint {
    const selectors = {
      11155111: BigInt('16015286601757825753'), // Ethereum Sepolia
      80001: BigInt('12532609583862916517'),   // Polygon Mumbai  
      421613: BigInt('6101244977088475029'),   // Arbitrum Goerli
    };
    
    const selector = selectors[chainId as keyof typeof selectors];
    if (!selector) throw new Error(`No chain selector for chain ${chainId}`);
    return selector;
  }
}

export const blockchainService = new BlockchainService();
