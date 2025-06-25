# Cross-Chain AI Dungeon Crawler

> A revolutionary blockchain-based multiplayer dungeon crawler featuring cross-chain party formation, AI-powered NPCs, and DeFi equipment lending marketplace.

## 🎯 Project Overview

Cross-Chain AI Dungeon Crawler combines the best of blockchain technology, artificial intelligence, and gaming to create an immersive multiplayer experience where players can:

- **Form cross-chain parties** using Chainlink CCIP across Ethereum, Polygon, and Arbitrum
- **Interact with AI-powered NPCs** using ElizaOS for dynamic dialogue and adaptive gameplay
- **Lend and borrow equipment** through a decentralized marketplace with collateral management
- **Generate procedural dungeons** with VRF-powered random loot distribution
- **Experience real-time multiplayer** gameplay with WebSocket connections

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chain A       │    │   Chain B       │    │   Chain C       │
│  (Ethereum)     │    │  (Polygon)      │    │  (Arbitrum)     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ PartyRegistry   │◄──►│ PartyRegistry   │◄──►│ PartyRegistry   │
│ LootManager     │    │ LootManager     │    │ LootManager     │
│ LendingPool     │    │ LendingPool     │    │ LendingPool     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Chainlink CCIP  │
                    │ Message Router  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Backend API     │
                    │ (Node.js/Express)│
                    ├─────────────────┤
                    │ • Game Engine   │
                    │ • Party Manager │
                    │ • Dungeon Gen   │
                    │ • AI Controller │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ ElizaOS AI      │
                    │ • NPCs          │
                    │ • Companions    │
                    │ • Dialogue      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Frontend        │
                    │ (React/Vite)    │
                    │ • Game UI       │
                    │ • Wallet Connect│
                    │ • Party Manager │
                    └─────────────────┘
```

### Package Structure

```
cross-chain-ai-dungeon-crawler/
├── packages/
│   ├── contracts/           # Smart contracts (Solidity + Foundry)
│   │   ├── src/
│   │   │   ├── PartyRegistry.sol
│   │   │   ├── LootManager.sol
│   │   │   ├── LendingPool.sol
│   │   │   └── CrossChainMessenger.sol
│   │   ├── test/
│   │   └── script/
│   ├── backend/             # Node.js API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── utils/
│   │   ├── prisma/
│   │   └── tests/
│   ├── frontend/            # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   └── public/
│   └── shared/              # Common types and utilities
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── dist/
├── docs/                    # Documentation
├── .github/                 # GitHub workflows and templates
└── scripts/                 # Build and deployment scripts
```

## 🚀 Technology Stack

### Blockchain Layer
- **Smart Contracts**: Solidity 0.8.19+ with Foundry
- **Cross-Chain**: Chainlink CCIP for multi-chain communication
- **Randomness**: Chainlink VRF v2 for secure random loot generation
- **External Data**: Chainlink Functions for off-chain data integration
- **Security**: OpenZeppelin contracts for battle-tested implementations

### Backend Services
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session and game state caching
- **Real-time**: Native WebSocket for multiplayer communication
- **AI Integration**: ElizaOS SDK for NPC personalities and dialogue

### Frontend Application
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: Zustand for global state
- **Web3**: Wagmi + RainbowKit for wallet integration
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion for smooth UI transitions

### Infrastructure & DevOps
- **Hosting**: Vercel (frontend) + Render (backend)
- **Storage**: IPFS for game assets and metadata
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Winston logging with error tracking

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm/yarn
- Git
- Foundry (for smart contracts)
- PostgreSQL (for backend)
- Redis (for caching)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/chaniiii/cross-chain-ai-dungeon-crawler.git
   cd cross-chain-ai-dungeon-crawler
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Smart contracts development node (Foundry)
   - Backend API server (Express + PostgreSQL)
   - Frontend development server (Vite + React)

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Contracts: Local Foundry node on port 8545

### Package-Specific Development

#### Smart Contracts (`packages/contracts`)
```bash
cd packages/contracts
forge build                    # Compile contracts
forge test                     # Run tests
forge test --watch             # Watch mode
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

#### Backend (`packages/backend`)
```bash
cd packages/backend
npm run dev                     # Start development server
npm run db:migrate             # Run database migrations
npm run db:studio              # Open Prisma Studio
npm test                       # Run tests
```

#### Frontend (`packages/frontend`)
```bash
cd packages/frontend
npm run dev                     # Start development server
npm run build                  # Build for production
npm test                       # Run tests
npm run lint                   # Lint code
```

## 🎮 Game Features

### Core Gameplay

1. **Player Registration**
   - Connect wallet (MetaMask, WalletConnect, etc.)
   - Create player profile with on-chain verification
   - Choose starting chain and initial equipment

2. **Cross-Chain Party Formation**
   - Create or join parties across different blockchain networks
   - Real-time synchronization using Chainlink CCIP
   - Party roles: Leader, Members, with voting mechanisms

3. **Procedural Dungeon Generation**
   - Algorithm-generated dungeon layouts
   - Multiple room types: Combat, Treasure, Boss, Events
   - Dynamic difficulty scaling based on party level

4. **Combat System**
   - Turn-based combat with AI-powered enemies
   - Equipment bonuses and special abilities
   - Real-time multiplayer synchronization

5. **Loot and Equipment**
   - VRF-generated random loot with rarity tiers
   - NFT equipment with on-chain metadata
   - Equipment marketplace with lending/borrowing

6. **AI Companions and NPCs**
   - ElizaOS-powered personalities
   - Context-aware dialogue systems
   - Adaptive behavior based on player actions

### DeFi Features

1. **Equipment Lending Marketplace**
   - Lend equipment to other players for fees
   - Collateral-based borrowing system
   - Automatic liquidation mechanisms

2. **Cross-Chain Asset Management**
   - Bridge assets between supported chains
   - Unified inventory across networks
   - Gas optimization for cross-chain transactions

3. **Tokenomics**
   - Native game token for governance and rewards
   - Yield farming for lent equipment
   - Treasury management for sustainability

## 🧪 Testing

### Smart Contracts
```bash
# Run all contract tests
npm run test:contracts

# Run with coverage
cd packages/contracts && forge coverage

# Run gas analysis
cd packages/contracts && forge test --gas-report
```

### Backend
```bash
# Run backend tests
npm run test:backend

# Watch mode
cd packages/backend && npm run test:watch

# Coverage report
cd packages/backend && npm run test:coverage
```

### Frontend
```bash
# Run frontend tests
npm run test:frontend

# Watch mode
cd packages/frontend && npm run test:watch

# Coverage report
cd packages/frontend && npm run test:coverage
```

### End-to-End Testing
```bash
# Run full system tests
npm run test:e2e
```

## 🚀 Deployment

### Local Development
```bash
# Start all services locally
npm run dev

# Deploy contracts to local network
npm run deploy:contracts:local

# Set up local database
cd packages/backend && npm run db:reset
```

### Testnet Deployment
```bash
# Deploy contracts to testnets
npm run deploy:contracts:testnet

# Deploy backend to staging
npm run deploy:backend:staging

# Deploy frontend to preview
npm run deploy:frontend:preview
```

### Production Deployment
```bash
# Deploy contracts to mainnet
npm run deploy:contracts:mainnet

# Deploy backend to production
npm run deploy:backend:production

# Deploy frontend to production
npm run deploy:frontend:production
```

## 📚 API Documentation

### REST Endpoints

#### Authentication
- `POST /api/auth/login` - Player login with wallet signature
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Player logout

#### Player Management
- `GET /api/players/profile` - Get player profile
- `PUT /api/players/profile` - Update player profile
- `GET /api/players/inventory` - Get player inventory
- `GET /api/players/stats` - Get player statistics

#### Party Management
- `POST /api/parties/create` - Create new party
- `GET /api/parties/:id` - Get party details
- `POST /api/parties/:id/join` - Join party
- `DELETE /api/parties/:id/leave` - Leave party
- `GET /api/parties/search` - Search available parties

#### Dungeon System
- `POST /api/dungeons/create` - Create new dungeon instance
- `GET /api/dungeons/:id` - Get dungeon state
- `POST /api/dungeons/:id/action` - Perform dungeon action
- `GET /api/dungeons/:id/loot` - Get available loot

#### Equipment Marketplace
- `GET /api/marketplace/equipment` - Browse equipment
- `POST /api/marketplace/lend` - List equipment for lending
- `POST /api/marketplace/borrow` - Borrow equipment
- `GET /api/marketplace/history` - Transaction history

### WebSocket Events

#### Real-time Communication
- `party:update` - Party state changes
- `dungeon:update` - Dungeon state changes
- `combat:action` - Combat actions
- `chat:message` - Party chat messages
- `ai:dialogue` - NPC dialogue events

## 🔧 Configuration

### Environment Variables

```bash
# Blockchain Configuration
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key

# Chainlink Configuration
VRF_SUBSCRIPTION_ID=your_subscription_id
CHAINLINK_VRF_COORDINATOR=coordinator_address
FUNCTIONS_ROUTER=functions_router_address

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/dungeon_crawler
REDIS_URL=redis://localhost:6379

# ElizaOS Configuration
ELIZAOS_API_KEY=your_elizaos_key
ELIZAOS_ENDPOINT=https://api.elizaos.com

# Frontend Configuration
VITE_API_URL=http://localhost:3001
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# Security
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12

# External Services
IPFS_GATEWAY=https://gateway.pinata.cloud
PINATA_API_KEY=your_pinata_key
```

## Deployments:

### Sepolia:
- CrossChainLootManager.sol : `0x194CadA5D03EF6Cd9AA51C3BB36EF64F4De174bB`
- LootManager.sol : `0xf755e942112584C0547C3f85392B2c2Ee602161B`
- PartyRegistry.sol : `0x93Fd309A0D457174bD94F4c7BCe60c589e6bE4D6`
- RandomLootGenerator.sol : `0xA19D323E6A4dB37c0f0F85F8FC2F7410e4061EC3`

### Avalanche

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style and linting rules
- Write tests for new features
- Update documentation as needed
- Use conventional commits for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chainlink](https://chain.link/) for cross-chain infrastructure
- [ElizaOS](https://elizaos.ai/) for AI-powered NPCs
- [OpenZeppelin](https://openzeppelin.com/) for secure smart contracts
- [Foundry](https://getfoundry.sh/) for smart contract development
- [Vite](https://vitejs.dev/) for fast frontend builds

## 📞 Support

- **Documentation**: [docs.chaniiii.game](https://docs.chaniiii.game)
- **Discord**: [Join our community](https://discord.gg/chaniiii)
- **Twitter**: [@ChaniiiiGame](https://twitter.com/ChaniiiiGame)
- **Email**: support@chaniiii.game

---

**Built with ❤️ by the Chaniiii Team**
