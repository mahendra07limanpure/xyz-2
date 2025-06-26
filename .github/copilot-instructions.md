<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Cross-Chain AI Dungeon Crawler - Copilot Instructions

## Project Overview
This is a Cross-Chain AI Dungeon Crawler project that combines blockchain technology, AI-powered NPCs, and DeFi mechanics. The project consists of multiple packages in a monorepo structure.

## Architecture
- **Smart Contracts**: Solidity contracts using Chainlink VRF, Functions, and CCIP for cross-chain functionality
- **Backend**: Node.js/Express API with ElizaOS AI integration, PostgreSQL database, and WebSocket support
- **Frontend**: React + TypeScript with Wagmi/RainbowKit for wallet integration
- **Database**: PostgreSQL with Prisma ORM for game state management

## Key Technologies
- **Blockchain**: Ethereum, Polygon, Arbitrum with Chainlink services
- **AI**: ElizaOS for NPC personalities and dialogue
- **DeFi**: Equipment lending marketplace with collateral management
- **Real-time**: WebSocket for multiplayer gameplay

## Code Style Guidelines
1. Use TypeScript for all JavaScript/Node.js code
2. Follow Solidity best practices with OpenZeppelin contracts
3. Implement proper error handling for cross-chain operations
4. Use async/await patterns for blockchain interactions
5. Maintain proper separation of concerns between packages

## Package Structure
- `/packages/contracts` - Smart contracts with Foundry/Hardhat
- `/packages/backend` - Node.js API with game logic
- `/packages/frontend` - React frontend with wallet integration
- `/packages/shared` - Common types and utilities

## Development Notes
- Always test cross-chain functionality on testnets first
- Use environment variables for sensitive data (private keys, API keys)
- Implement proper logging for debugging blockchain interactions
- Follow the EIP standards for NFT and token contracts
- Use Chainlink VRF for truly random loot generation

## AI Integration
- ElizaOS agents should have distinct personalities
- Implement context-aware dialogue based on game state
- Use AI for adaptive difficulty and dynamic NPC behavior

## Security Considerations
- Implement proper access controls on smart contracts
- Use OpenZeppelin's security patterns
- Validate all user inputs in both frontend and backend
- Implement rate limiting for API endpoints
- Use proper authentication for cross-chain operations
