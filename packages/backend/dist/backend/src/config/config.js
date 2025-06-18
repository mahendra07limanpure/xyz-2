"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    blockchain: {
        privateKey: process.env.PRIVATE_KEY || '',
        networks: {
            sepolia: process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            ...(process.env.INFURA_API_KEY && {
                polygonMumbai: process.env.POLYGON_MUMBAI_RPC_URL || `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
                arbitrumGoerli: process.env.ARBITRUM_GOERLI_RPC_URL || `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
            }),
        },
        contracts: {
            lootManager: process.env.LOOT_MANAGER_ADDRESS || '',
            partyRegistry: process.env.PARTY_REGISTRY_ADDRESS || '',
            crossChainLootManager: process.env.CROSS_CHAIN_LOOT_MANAGER_ADDRESS || '',
            randomLootGenerator: process.env.RANDOM_LOOT_GENERATOR_ADDRESS || '',
        },
        chainlink: {
            vrfCoordinator: process.env.CHAINLINK_VRF_COORDINATOR || '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
            subscriptionId: process.env.CHAINLINK_SUBSCRIPTION_ID || '',
            gasLane: process.env.CHAINLINK_GAS_LANE || '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
        },
    },
    elizaConfig: {
        apiKey: process.env.ELIZA_API_KEY || '',
        model: process.env.ELIZA_MODEL || 'gpt-4',
    },
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
//# sourceMappingURL=config.js.map