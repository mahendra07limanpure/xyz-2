import { createPublicClient, type WalletClient, type PublicClient, getContract, http } from 'viem';
import { CONTRACT_ADDRESSES } from '../utils/contractAddresses';
import { CHAINS } from '../utils/chains';

import PartyRegistryJson from '../abi/PartyRegistry.json';
import LootManagerJson from '../abi/LootManager.json';

const partyRegistryAbi = PartyRegistryJson.abi;
const lootManagerAbi = LootManagerJson.abi;


export class BlockchainService {
  private publicClients: Map<number, PublicClient> = new Map();

  constructor() {
    for (const chainId of Object.keys(CONTRACT_ADDRESSES).map(Number)) {
        this.publicClients.set(
            chainId,
            createPublicClient({
              chain: CHAINS[chainId],
              transport: http(CHAINS[chainId].rpcUrls.default.http[0]),
            })
          );
    }
  }

  private getPublicClient(chainId: number): PublicClient {
    const client = this.publicClients.get(chainId);
    if (!client) throw new Error(`Unsupported chain ${chainId}`);
    return client;
  }

  private getContractAbi(name: 'LootManager' | 'PartyRegistry') {
    if (name === 'LootManager') return lootManagerAbi;
    if (name === 'PartyRegistry') return partyRegistryAbi;
    throw new Error(`Unknown ABI: ${name}`);
  }

  private getContractAddress(chainId: number, contract: keyof typeof CONTRACT_ADDRESSES[11155111]) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    if (!addresses) throw new Error(`No addresses for chain ${chainId}`);
    return addresses[contract];
  }

  // READ: get party info
  async getParty(chainId: number, partyId: bigint) {
    const publicClient = this.getPublicClient(chainId);
    const contract = getContract({
      address: this.getContractAddress(chainId, 'partyRegistry'),
      abi: partyRegistryAbi,
      publicClient,
    });

    const party = await contract.read.getParty([partyId]);
    return party;
  }

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
    });

    return { transactionHash: hash };
  }

  async registerPlayer(walletClient: WalletClient, chainId: number): Promise<string> {
    const hash = await walletClient.writeContract({
      address: this.getContractAddress(chainId, 'partyRegistry'),
      abi: partyRegistryAbi,
      functionName: 'registerPlayer',
      args: []
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
    });

    return hash;
  }
}

export const blockchainService = new BlockchainService();
