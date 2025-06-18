import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';

// Use a default project ID for local development if not provided
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id-for-development';

export const config = getDefaultConfig({
  appName: 'Cross-Chain AI Dungeon Crawler',
  projectId,
  chains: [mainnet, polygon, arbitrum, sepolia],
  ssr: false,
});
