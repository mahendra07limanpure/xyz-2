import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  blockchain: {
    privateKey: string;
    networks: {
      sepolia: string;
      polygonMumbai?: string;
      arbitrumGoerli?: string;
    };
    contracts: {
      lootManager: string;
      partyRegistry: string;
      crossChainLootManager: string;
      randomLootGenerator: string;
    };
    chainlink: {
      vrfCoordinator: string;
      subscriptionId: string;
      gasLane: string;
    };
  };
  elizaConfig: {
    apiKey: string;
    model: string;
  };
  corsOrigin: string;
}

export const config: Config = {
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
