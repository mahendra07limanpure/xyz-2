import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  chainlinkVrfCoordinator: string;
  chainlinkSubscriptionId: string;
  chainlinkGasLane: string;
  rpcUrls: {
    ethereum: string;
    polygon: string;
    arbitrum: string;
  };
  privateKey: string;
  elizaConfig: {
    apiKey: string;
    model: string;
  };
  corsOrigin: string;
}

export const config: Config = {
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
