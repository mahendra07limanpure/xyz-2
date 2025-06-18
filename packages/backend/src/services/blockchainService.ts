import { ethers, Contract, JsonRpcProvider, Wallet } from 'ethers';
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { sepolia, polygonMumbai, arbitrumGoerli } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { logger } from '../utils/logger';
import { config } from '../config/config';

// Contract ABIs (minimal required functions)
const LOOT_MANAGER_ABI = parseAbi([
  'function mintLoot(address to, string memory name, string memory lootType, uint256 rarity, uint256 power, string[] memory attributes) external returns (uint256)',
  'function burnLoot(uint256 tokenId) external',
  'function getPlayerEquipment(address player) external view returns (uint256[])',
  'function setLendingStatus(uint256 tokenId, bool isLendable) external',
  'function requestLoot(address player, uint256 partyId, uint256 dungeonLevel) external returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function transferFrom(address from, address to, uint256 tokenId) external'
]);

const PARTY_REGISTRY_ABI = parseAbi([
  'function registerPlayer() external',
  'function createParty(uint256 maxSize) external returns (uint256)',
  'function joinParty(uint256 partyId) external',
  'function leaveParty() external',
  'function getPartyMembers(uint256 partyId) external view returns (address[])',
  'function getPartySize(uint256 partyId) external view returns (uint256)',
  'function isPartyActive(uint256 partyId) external view returns (bool)',
  'function isPlayerInParty(uint256 partyId, address player) external view returns (bool)',
  'function updatePlayerStats(address player, uint256 newLevel, uint256 newExperience) external'
]);

const CROSS_CHAIN_LOOT_MANAGER_ABI = parseAbi([
  'function transferCrossChain(uint64 destinationChainSelector, address receiver, uint256 lootId, address feeTokenAddress) external payable returns (bytes32)',
  'function allowlistDestinationChain(uint64 destinationChainSelector, bool allowed) external',
  'function allowlistSourceChain(uint64 sourceChainSelector, bool allowed) external',
  'function allowlistSender(address sender, bool allowed) external'
]);

interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  lootManagerAddress: string;
  partyRegistryAddress: string;
  crossChainLootManagerAddress: string;
  ccipChainSelector?: string;
}

interface ContractAddresses {
  lootManager: string;
  partyRegistry: string;
  crossChainLootManager: string;
  randomLootGenerator: string;
}

export class BlockchainService {
  private providers: Map<number, JsonRpcProvider> = new Map();
  private publicClients: Map<number, any> = new Map();
  private walletClients: Map<number, any> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private account: any;
  
  // Contract addresses per chain
  private contractAddresses: Map<number, ContractAddresses> = new Map();

  constructor() {
    this.initializeClients();
    this.loadContractAddresses();
  }

  private initializeClients() {
    const privateKey = config.blockchain.privateKey;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not provided in environment variables');
    }

    this.account = privateKeyToAccount(privateKey as `0x${string}`);

    // Sepolia (11155111)
    const sepoliaProvider = new JsonRpcProvider(config.blockchain.networks.sepolia);
    this.providers.set(11155111, sepoliaProvider);
    
    this.publicClients.set(11155111, createPublicClient({
      chain: sepolia,
      transport: http(config.blockchain.networks.sepolia)
    }));

    this.walletClients.set(11155111, createWalletClient({
      chain: sepolia,
      transport: http(config.blockchain.networks.sepolia),
      account: this.account
    }));

    // Polygon Mumbai (80001)
    if (config.blockchain.networks.polygonMumbai) {
      const mumbaiProvider = new JsonRpcProvider(config.blockchain.networks.polygonMumbai);
      this.providers.set(80001, mumbaiProvider);
      
      this.publicClients.set(80001, createPublicClient({
        chain: polygonMumbai,
        transport: http(config.blockchain.networks.polygonMumbai)
      }));

      this.walletClients.set(80001, createWalletClient({
        chain: polygonMumbai,
        transport: http(config.blockchain.networks.polygonMumbai),
        account: this.account
      }));
    }

    // Arbitrum Goerli (421613)
    if (config.blockchain.networks.arbitrumGoerli) {
      const arbitrumProvider = new JsonRpcProvider(config.blockchain.networks.arbitrumGoerli);
      this.providers.set(421613, arbitrumProvider);
      
      this.publicClients.set(421613, createPublicClient({
        chain: arbitrumGoerli,
        transport: http(config.blockchain.networks.arbitrumGoerli)
      }));

      this.walletClients.set(421613, createWalletClient({
        chain: arbitrumGoerli,
        transport: http(config.blockchain.networks.arbitrumGoerli),
        account: this.account
      }));
    }

    logger.info('Blockchain clients initialized');
  }

  private loadContractAddresses() {
    // Load from environment variables or config
    // Sepolia addresses
    this.contractAddresses.set(11155111, {
      lootManager: config.blockchain.contracts.lootManager || '',
      partyRegistry: config.blockchain.contracts.partyRegistry || '',
      crossChainLootManager: config.blockchain.contracts.crossChainLootManager || '',
      randomLootGenerator: config.blockchain.contracts.randomLootGenerator || ''
    });

    // Add other networks as needed
    logger.info('Contract addresses loaded');
  }

  // Loot Management Functions
  async mintLoot(
    chainId: number,
    playerAddress: string,
    name: string,
    lootType: string,
    rarity: number,
    power: number,
    attributes: string[]
  ): Promise<{ tokenId: bigint; transactionHash: string }> {
    try {
      const walletClient = this.walletClients.get(chainId);
      const publicClient = this.publicClients.get(chainId);
      const addresses = this.contractAddresses.get(chainId);

      if (!walletClient || !publicClient || !addresses?.lootManager) {
        throw new Error(`Chain ${chainId} not supported or contract address missing`);
      }

      const hash = await walletClient.writeContract({
        address: addresses.lootManager as `0x${string}`,
        abi: LOOT_MANAGER_ABI,
        functionName: 'mintLoot',
        args: [
          playerAddress as `0x${string}`,
          name,
          lootType,
          BigInt(rarity),
          BigInt(power),
          attributes
        ]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Extract tokenId from logs
      const tokenId = this.extractTokenIdFromLogs(receipt.logs);

      logger.info(`Loot minted: ${name} for ${playerAddress}`, {
        chainId,
        tokenId: tokenId.toString(),
        transactionHash: hash
      });

      return {
        tokenId,
        transactionHash: hash
      };
    } catch (error) {
      logger.error('Error minting loot:', error);
      throw error;
    }
  }

  async getLootDetails(chainId: number, tokenId: bigint): Promise<any> {
    try {
      const publicClient = this.publicClients.get(chainId);
      const addresses = this.contractAddresses.get(chainId);

      if (!publicClient || !addresses?.lootManager) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const lootData = await publicClient.readContract({
        address: addresses.lootManager as `0x${string}`,
        abi: LOOT_MANAGER_ABI,
        functionName: 'getLoot',
        args: [tokenId]
      });

      return {
        name: lootData[0],
        lootType: lootData[1],
        rarity: Number(lootData[2]),
        power: Number(lootData[3]),
        attributes: lootData[4]
      };
    } catch (error) {
      logger.error('Error getting loot details:', error);
      throw error;
    }
  }

  async getPlayerEquipment(chainId: number, playerAddress: string): Promise<bigint[]> {
    try {
      const publicClient = this.publicClients.get(chainId);
      const addresses = this.contractAddresses.get(chainId);

      if (!publicClient || !addresses?.lootManager) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const tokenIds = await publicClient.readContract({
        address: addresses.lootManager as `0x${string}`,
        abi: LOOT_MANAGER_ABI,
        functionName: 'getPlayerEquipment',
        args: [playerAddress as `0x${string}`]
      });

      return tokenIds as bigint[];
    } catch (error) {
      logger.error('Error getting player equipment:', error);
      throw error;
    }
  }

  // Party Management Functions
  async registerPlayer(chainId: number, playerAddress: string): Promise<string> {
    try {
      const walletClient = this.walletClients.get(chainId);
      const addresses = this.contractAddresses.get(chainId);

      if (!walletClient || !addresses?.partyRegistry) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const hash = await walletClient.writeContract({
        address: addresses.partyRegistry as `0x${string}`,
        abi: PARTY_REGISTRY_ABI,
        functionName: 'registerPlayer'
      });

      logger.info(`Player registered: ${playerAddress}`, { chainId, transactionHash: hash });
      return hash;
    } catch (error) {
      logger.error('Error registering player:', error);
      throw error;
    }
  }

  async createParty(chainId: number, maxSize: number): Promise<{ partyId: bigint; transactionHash: string }> {
    try {
      const walletClient = this.walletClients.get(chainId);
      const publicClient = this.publicClients.get(chainId);
      const addresses = this.contractAddresses.get(chainId);

      if (!walletClient || !publicClient || !addresses?.partyRegistry) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const hash = await walletClient.writeContract({
        address: addresses.partyRegistry as `0x${string}`,
        abi: PARTY_REGISTRY_ABI,
        functionName: 'createParty',
        args: [BigInt(maxSize)]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const partyId = this.extractPartyIdFromLogs(receipt.logs);

      logger.info(`Party created with ID: ${partyId}`, { chainId, transactionHash: hash });

      return {
        partyId,
        transactionHash: hash
      };
    } catch (error) {
      logger.error('Error creating party:', error);
      throw error;
    }
  }

  async getPartyDetails(chainId: number, partyId: bigint): Promise<any> {
    try {
      const publicClient = this.publicClients.get(chainId);
      const addresses = this.contractAddresses.get(chainId);

      if (!publicClient || !addresses?.partyRegistry) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const partyData = await publicClient.readContract({
        address: addresses.partyRegistry as `0x${string}`,
        abi: PARTY_REGISTRY_ABI,
        functionName: 'getParty',
        args: [partyId]
      });

      return {
        id: Number(partyData[0]),
        leader: partyData[1],
        members: partyData[2],
        maxSize: Number(partyData[3]),
        chainId: Number(partyData[4]),
        isActive: partyData[5],
        createdAt: Number(partyData[6]),
        dungeonSeed: partyData[7]
      };
    } catch (error) {
      logger.error('Error getting party details:', error);
      throw error;
    }
  }

  // Cross-Chain Functions
  async transferLootCrossChain(
    sourceChainId: number,
    destinationChainSelector: string,
    receiverAddress: string,
    tokenId: bigint,
    feeTokenAddress?: string
  ): Promise<string> {
    try {
      const walletClient = this.walletClients.get(sourceChainId);
      const addresses = this.contractAddresses.get(sourceChainId);

      if (!walletClient || !addresses?.crossChainLootManager) {
        throw new Error(`Chain ${sourceChainId} not supported`);
      }

      const hash = await walletClient.writeContract({
        address: addresses.crossChainLootManager as `0x${string}`,
        abi: CROSS_CHAIN_LOOT_MANAGER_ABI,
        functionName: 'transferCrossChain',
        args: [
          destinationChainSelector as `0x${string}`,
          receiverAddress as `0x${string}`,
          tokenId,
          (feeTokenAddress || '0x0000000000000000000000000000000000000000') as `0x${string}`
        ],
        value: BigInt('100000000000000000') // 0.1 ETH for fees
      });

      logger.info(`Cross-chain transfer initiated`, {
        sourceChainId,
        destinationChainSelector,
        tokenId: tokenId.toString(),
        transactionHash: hash
      });

      return hash;
    } catch (error) {
      logger.error('Error transferring loot cross-chain:', error);
      throw error;
    }
  }

  // Utility Functions
  private extractTokenIdFromLogs(logs: any[]): bigint {
    // Look for Transfer event or EquipmentCreated event
    for (const log of logs) {
      try {
        // This is a simplified version - in production, you'd parse the actual event logs
        // For now, we'll return a mock value
        return BigInt(Math.floor(Math.random() * 1000000));
      } catch (error) {
        continue;
      }
    }
    return BigInt(0);
  }

  private extractPartyIdFromLogs(logs: any[]): bigint {
    // Look for PartyCreated event
    for (const log of logs) {
      try {
        // This is a simplified version - in production, you'd parse the actual event logs
        return BigInt(Math.floor(Math.random() * 1000000));
      } catch (error) {
        continue;
      }
    }
    return BigInt(0);
  }

  // Health check
  async checkConnection(chainId: number): Promise<boolean> {
    try {
      const publicClient = this.publicClients.get(chainId);
      if (!publicClient) return false;

      const blockNumber = await publicClient.getBlockNumber();
      return blockNumber > 0;
    } catch (error) {
      logger.error(`Connection check failed for chain ${chainId}:`, error);
      return false;
    }
  }

  // Get supported chains
  getSupportedChains(): number[] {
    return Array.from(this.publicClients.keys());
  }

  // Update contract addresses (for deployment)
  updateContractAddresses(chainId: number, addresses: Partial<ContractAddresses>) {
    const existing = this.contractAddresses.get(chainId) || {
      lootManager: '',
      partyRegistry: '',
      crossChainLootManager: '',
      randomLootGenerator: ''
    };

    this.contractAddresses.set(chainId, { ...existing, ...addresses });
    logger.info(`Contract addresses updated for chain ${chainId}`, addresses);
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();
