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
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/dungeon_crawler',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    chainlinkVrfCoordinator: process.env.CHAINLINK_VRF_COORDINATOR || '',
    chainlinkSubscriptionId: process.env.CHAINLINK_SUBSCRIPTION_ID || '',
    chainlinkGasLane: process.env.CHAINLINK_GAS_LANE || '',
    rpcUrls: {
        ethereum: process.env.ETHEREUM_RPC_URL || '',
        polygon: process.env.POLYGON_RPC_URL || '',
        arbitrum: process.env.ARBITRUM_RPC_URL || '',
    },
    privateKey: process.env.PRIVATE_KEY || '',
    elizaConfig: {
        apiKey: process.env.ELIZA_API_KEY || '',
        model: process.env.ELIZA_MODEL || 'gpt-4',
    },
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
//# sourceMappingURL=config.js.map