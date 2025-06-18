"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = exports.BlockchainService = void 0;
const ethers_1 = require("ethers");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
const logger_1 = require("../utils/logger");
const config_1 = require("../config/config");
const LOOT_MANAGER_ABI = (0, viem_1.parseAbi)([
    'function mintLoot(address to, string memory name, string memory lootType, uint256 rarity, uint256 power, string[] memory attributes) external returns (uint256)',
    'function burnLoot(uint256 tokenId) external',
    'function getEquipment(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint8 equipmentType, uint8 rarity, string name, uint256 attackPower, uint256 defensePower, uint256 magicPower, uint256 durability, bool isLendable, address originalOwner, uint256 createdAt, string lootType, uint256 power, string[] attributes))',
    'function getLoot(uint256 tokenId) external view returns (tuple(string name, string lootType, uint256 rarity, uint256 power, string[] attributes))',
    'function getPlayerEquipment(address player) external view returns (uint256[])',
    'function setLendingStatus(uint256 tokenId, bool isLendable) external',
    'function requestLoot(address player, uint256 partyId, uint256 dungeonLevel) external returns (uint256)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'function transferFrom(address from, address to, uint256 tokenId) external'
]);
const PARTY_REGISTRY_ABI = (0, viem_1.parseAbi)([
    'function registerPlayer() external',
    'function createParty(uint256 maxSize) external returns (uint256)',
    'function joinParty(uint256 partyId) external',
    'function leaveParty() external',
    'function getParty(uint256 partyId) external view returns (tuple(uint256 id, address leader, address[] members, uint256 maxSize, uint256 chainId, bool isActive, uint256 createdAt, bytes32 dungeonSeed))',
    'function getPlayer(address playerAddress) external view returns (tuple(address wallet, uint256 level, uint256 experience, bool isRegistered, uint256 currentPartyId))',
    'function isPlayerInParty(uint256 partyId, address player) external view returns (bool)',
    'function updatePlayerStats(address player, uint256 newLevel, uint256 newExperience) external'
]);
const CROSS_CHAIN_LOOT_MANAGER_ABI = (0, viem_1.parseAbi)([
    'function transferCrossChain(uint64 destinationChainSelector, address receiver, uint256 lootId, address feeTokenAddress) external payable returns (bytes32)',
    'function allowlistDestinationChain(uint64 destinationChainSelector, bool allowed) external',
    'function allowlistSourceChain(uint64 sourceChainSelector, bool allowed) external',
    'function allowlistSender(address sender, bool allowed) external'
]);
class BlockchainService {
    constructor() {
        this.providers = new Map();
        this.publicClients = new Map();
        this.walletClients = new Map();
        this.contracts = new Map();
        this.contractAddresses = new Map();
        this.initializeClients();
        this.loadContractAddresses();
    }
    initializeClients() {
        const privateKey = config_1.config.blockchain.privateKey;
        if (!privateKey) {
            throw new Error('PRIVATE_KEY not provided in environment variables');
        }
        this.account = (0, accounts_1.privateKeyToAccount)(privateKey);
        const sepoliaProvider = new ethers_1.JsonRpcProvider(config_1.config.blockchain.networks.sepolia);
        this.providers.set(11155111, sepoliaProvider);
        this.publicClients.set(11155111, (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(config_1.config.blockchain.networks.sepolia)
        }));
        this.walletClients.set(11155111, (0, viem_1.createWalletClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(config_1.config.blockchain.networks.sepolia),
            account: this.account
        }));
        if (config_1.config.blockchain.networks.polygonMumbai) {
            const mumbaiProvider = new ethers_1.JsonRpcProvider(config_1.config.blockchain.networks.polygonMumbai);
            this.providers.set(80001, mumbaiProvider);
            this.publicClients.set(80001, (0, viem_1.createPublicClient)({
                chain: chains_1.polygonMumbai,
                transport: (0, viem_1.http)(config_1.config.blockchain.networks.polygonMumbai)
            }));
            this.walletClients.set(80001, (0, viem_1.createWalletClient)({
                chain: chains_1.polygonMumbai,
                transport: (0, viem_1.http)(config_1.config.blockchain.networks.polygonMumbai),
                account: this.account
            }));
        }
        if (config_1.config.blockchain.networks.arbitrumGoerli) {
            const arbitrumProvider = new ethers_1.JsonRpcProvider(config_1.config.blockchain.networks.arbitrumGoerli);
            this.providers.set(421613, arbitrumProvider);
            this.publicClients.set(421613, (0, viem_1.createPublicClient)({
                chain: chains_1.arbitrumGoerli,
                transport: (0, viem_1.http)(config_1.config.blockchain.networks.arbitrumGoerli)
            }));
            this.walletClients.set(421613, (0, viem_1.createWalletClient)({
                chain: chains_1.arbitrumGoerli,
                transport: (0, viem_1.http)(config_1.config.blockchain.networks.arbitrumGoerli),
                account: this.account
            }));
        }
        logger_1.logger.info('Blockchain clients initialized');
    }
    loadContractAddresses() {
        this.contractAddresses.set(11155111, {
            lootManager: config_1.config.blockchain.contracts.lootManager || '',
            partyRegistry: config_1.config.blockchain.contracts.partyRegistry || '',
            crossChainLootManager: config_1.config.blockchain.contracts.crossChainLootManager || '',
            randomLootGenerator: config_1.config.blockchain.contracts.randomLootGenerator || ''
        });
        logger_1.logger.info('Contract addresses loaded');
    }
    async mintLoot(chainId, playerAddress, name, lootType, rarity, power, attributes) {
        try {
            const walletClient = this.walletClients.get(chainId);
            const publicClient = this.publicClients.get(chainId);
            const addresses = this.contractAddresses.get(chainId);
            if (!walletClient || !publicClient || !addresses?.lootManager) {
                throw new Error(`Chain ${chainId} not supported or contract address missing`);
            }
            const hash = await walletClient.writeContract({
                address: addresses.lootManager,
                abi: LOOT_MANAGER_ABI,
                functionName: 'mintLoot',
                args: [
                    playerAddress,
                    name,
                    lootType,
                    BigInt(rarity),
                    BigInt(power),
                    attributes
                ]
            });
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            const tokenId = this.extractTokenIdFromLogs(receipt.logs);
            logger_1.logger.info(`Loot minted: ${name} for ${playerAddress}`, {
                chainId,
                tokenId: tokenId.toString(),
                transactionHash: hash
            });
            return {
                tokenId,
                transactionHash: hash
            };
        }
        catch (error) {
            logger_1.logger.error('Error minting loot:', error);
            throw error;
        }
    }
    async getLootDetails(chainId, tokenId) {
        try {
            const publicClient = this.publicClients.get(chainId);
            const addresses = this.contractAddresses.get(chainId);
            if (!publicClient || !addresses?.lootManager) {
                throw new Error(`Chain ${chainId} not supported`);
            }
            const lootData = await publicClient.readContract({
                address: addresses.lootManager,
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
        }
        catch (error) {
            logger_1.logger.error('Error getting loot details:', error);
            throw error;
        }
    }
    async getPlayerEquipment(chainId, playerAddress) {
        try {
            const publicClient = this.publicClients.get(chainId);
            const addresses = this.contractAddresses.get(chainId);
            if (!publicClient || !addresses?.lootManager) {
                throw new Error(`Chain ${chainId} not supported`);
            }
            const tokenIds = await publicClient.readContract({
                address: addresses.lootManager,
                abi: LOOT_MANAGER_ABI,
                functionName: 'getPlayerEquipment',
                args: [playerAddress]
            });
            return tokenIds;
        }
        catch (error) {
            logger_1.logger.error('Error getting player equipment:', error);
            throw error;
        }
    }
    async registerPlayer(chainId, playerAddress) {
        try {
            const walletClient = this.walletClients.get(chainId);
            const addresses = this.contractAddresses.get(chainId);
            if (!walletClient || !addresses?.partyRegistry) {
                throw new Error(`Chain ${chainId} not supported`);
            }
            const hash = await walletClient.writeContract({
                address: addresses.partyRegistry,
                abi: PARTY_REGISTRY_ABI,
                functionName: 'registerPlayer'
            });
            logger_1.logger.info(`Player registered: ${playerAddress}`, { chainId, transactionHash: hash });
            return hash;
        }
        catch (error) {
            logger_1.logger.error('Error registering player:', error);
            throw error;
        }
    }
    async createParty(chainId, maxSize) {
        try {
            const walletClient = this.walletClients.get(chainId);
            const publicClient = this.publicClients.get(chainId);
            const addresses = this.contractAddresses.get(chainId);
            if (!walletClient || !publicClient || !addresses?.partyRegistry) {
                throw new Error(`Chain ${chainId} not supported`);
            }
            const hash = await walletClient.writeContract({
                address: addresses.partyRegistry,
                abi: PARTY_REGISTRY_ABI,
                functionName: 'createParty',
                args: [BigInt(maxSize)]
            });
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            const partyId = this.extractPartyIdFromLogs(receipt.logs);
            logger_1.logger.info(`Party created with ID: ${partyId}`, { chainId, transactionHash: hash });
            return {
                partyId,
                transactionHash: hash
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating party:', error);
            throw error;
        }
    }
    async getPartyDetails(chainId, partyId) {
        try {
            const publicClient = this.publicClients.get(chainId);
            const addresses = this.contractAddresses.get(chainId);
            if (!publicClient || !addresses?.partyRegistry) {
                throw new Error(`Chain ${chainId} not supported`);
            }
            const partyData = await publicClient.readContract({
                address: addresses.partyRegistry,
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
        }
        catch (error) {
            logger_1.logger.error('Error getting party details:', error);
            throw error;
        }
    }
    async transferLootCrossChain(sourceChainId, destinationChainSelector, receiverAddress, tokenId, feeTokenAddress) {
        try {
            const walletClient = this.walletClients.get(sourceChainId);
            const addresses = this.contractAddresses.get(sourceChainId);
            if (!walletClient || !addresses?.crossChainLootManager) {
                throw new Error(`Chain ${sourceChainId} not supported`);
            }
            const hash = await walletClient.writeContract({
                address: addresses.crossChainLootManager,
                abi: CROSS_CHAIN_LOOT_MANAGER_ABI,
                functionName: 'transferCrossChain',
                args: [
                    destinationChainSelector,
                    receiverAddress,
                    tokenId,
                    (feeTokenAddress || '0x0000000000000000000000000000000000000000')
                ],
                value: BigInt('100000000000000000')
            });
            logger_1.logger.info(`Cross-chain transfer initiated`, {
                sourceChainId,
                destinationChainSelector,
                tokenId: tokenId.toString(),
                transactionHash: hash
            });
            return hash;
        }
        catch (error) {
            logger_1.logger.error('Error transferring loot cross-chain:', error);
            throw error;
        }
    }
    extractTokenIdFromLogs(logs) {
        for (const log of logs) {
            try {
                return BigInt(Math.floor(Math.random() * 1000000));
            }
            catch (error) {
                continue;
            }
        }
        return BigInt(0);
    }
    extractPartyIdFromLogs(logs) {
        for (const log of logs) {
            try {
                return BigInt(Math.floor(Math.random() * 1000000));
            }
            catch (error) {
                continue;
            }
        }
        return BigInt(0);
    }
    async checkConnection(chainId) {
        try {
            const publicClient = this.publicClients.get(chainId);
            if (!publicClient)
                return false;
            const blockNumber = await publicClient.getBlockNumber();
            return blockNumber > 0;
        }
        catch (error) {
            logger_1.logger.error(`Connection check failed for chain ${chainId}:`, error);
            return false;
        }
    }
    getSupportedChains() {
        return Array.from(this.publicClients.keys());
    }
    updateContractAddresses(chainId, addresses) {
        const existing = this.contractAddresses.get(chainId) || {
            lootManager: '',
            partyRegistry: '',
            crossChainLootManager: '',
            randomLootGenerator: ''
        };
        this.contractAddresses.set(chainId, { ...existing, ...addresses });
        logger_1.logger.info(`Contract addresses updated for chain ${chainId}`, addresses);
    }
}
exports.BlockchainService = BlockchainService;
exports.blockchainService = new BlockchainService();
//# sourceMappingURL=blockchainService.js.map