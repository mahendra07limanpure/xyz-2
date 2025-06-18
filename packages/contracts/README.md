# Smart Contracts - Cross-Chain AI Dungeon CrawlerThis package contains the smart contracts for the Cross-Chain AI Dungeon Crawler game, built with Solidity and Foundry.## 🏗️ ArchitectureThe contracts package provides a complete blockchain infrastructure for cross-chain loot management, party formation, and truly random loot generation using Chainlink services.### Core Contracts#### 1. **LootManager** (`src/LootManager.sol`)- **Purpose**: Main NFT contract for game equipment- **Features**:  - ERC721 compliant equipment NFTs  - Chainlink VRF integration for random loot generation  - Equipment lending system  - Cross-chain compatibility (CCIP)  - Multiple equipment types: Weapon, Armor, Accessory, Consumable  - Six rarity levels: Common, Uncommon, Rare, Epic, Legendary, Mythic#### 2. **PartyRegistry** (`src/PartyRegistry.sol`)- **Purpose**: Manages player parties and cross-chain synchronization- **Features**:  - Player registration system  - Party creation and management  - Cross-chain party synchronization  - Leader-based party control  - Experience and level tracking#### 3. **RandomLootGenerator** (`src/RandomLootGenerator.sol`)- **Purpose**: Generates truly random loot using Chainlink VRF- **Features**:  - Chainlink VRF v2 integration  - Configurable rarity probabilities  - Dynamic loot naming system  - Dungeon level scaling  - Request fulfillment tracking#### 4. **CrossChainLootManager** (`src/CrossChainLootManager.sol`)- **Purpose**: Handles cross-chain loot transfers using Chainlink CCIP- **Features**:  - Cross-chain loot transfers  - Allowlist management for supported chains  - Fee calculation and management  - Message verification and validation  - Integration with LootManager## 🚀 Quick Start### Prerequisites- [Foundry](https://book.getfoundry.sh/getting-started/installation)- Node.js 18+- Git### Installation```bash# Install Foundry dependenciesforge install# Build contractsforge build# Run testsforge test```

### Environment Setup

Create a `.env` file in the `packages/contracts` directory:

```env
# Deployment
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key

# Chainlink VRF
VRF_SUBSCRIPTION_ID=your_vrf_subscription_id

# Network URLs (automatically configured via foundry.toml)
```

## 🧪 Testing

The test suite covers all major functionality:

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test file
forge test --match-path test/LootManager.t.sol

# Run with verbosity
forge test -vvv
```

### Test Coverage

- **LootManager Tests**: Equipment minting, burning, lending, party integration
- **PartyRegistry Tests**: Player registration, party creation, joining
- **CrossChainLootManager Tests**: Cross-chain transfers, allowlist management
- **RandomLootGenerator Tests**: VRF integration, loot generation

## 🚢 Deployment

### Basic Deployment (LootManager + PartyRegistry)

```bash
# Deploy to Sepolia testnet
forge script script/DeployBasic.s.sol --rpc-url sepolia --cast --verify

# Deploy to Polygon Mumbai
forge script script/DeployBasic.s.sol --rpc-url polygon_mumbai --cast --verify
```

### Full Deployment (All Contracts)

```bash
# Deploy all contracts to Sepolia
forge script script/DeployAll.s.sol --rpc-url sepolia --cast --verify
```

### Supported Networks

- **Sepolia** (Ethereum Testnet)
- **Polygon Mumbai** (Polygon Testnet)
- **Arbitrum Goerli** (Arbitrum Testnet)
- **Mainnet** (Production)

## 🔧 Configuration

### Foundry Configuration (`foundry.toml`)

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.25"
optimizer = true
optimizer_runs = 200
via_ir = true  # Required for complex contracts

# Remappings for dependencies
remappings = [
    "@chainlink/contracts/=lib/chainlink/contracts/",
    "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",
]
```

### Chainlink Integration

#### VRF (Verifiable Random Function)
- **Subscription**: Create a VRF subscription on [vrf.chain.link](https://vrf.chain.link)
- **Configuration**: Update VRF parameters in deployment scripts
- **Funding**: Ensure subscription has sufficient LINK tokens

#### CCIP (Cross-Chain Interoperability Protocol)
- **Router**: Uses Chainlink CCIP routers for cross-chain messaging
- **Allowlist**: Configure supported destination chains
- **Fees**: Automatic fee calculation for cross-chain transfers

## 🏁 Contract Interactions

### LootManager Usage

```solidity
// Mint loot for a player
uint256 lootId = lootManager.mintLoot(
    playerAddress,
    "Fire Sword",
    "Weapon",
    2, // Rare
    100, // Power
    attributes
);

// Set lending status
lootManager.setLendingStatus(lootId, true);

// Get equipment details
LootManager.Equipment memory equipment = lootManager.getEquipment(lootId);
```

### PartyRegistry Usage

```solidity
// Register as a player
partyRegistry.registerPlayer();

// Create a party
uint256 partyId = partyRegistry.createParty(4); // Max 4 members

// Join a party
partyRegistry.joinParty(partyId);
```

### Cross-Chain Transfers

```solidity
// Prepare cross-chain transfer
bytes32 messageId = crossChainLootManager.transferCrossChain(
    destinationChainSelector,
    recipientAddress,
    lootId,
    address(0) // Pay fees in native token
);
```

## 🔒 Security Features

- **Access Control**: Owner-only functions for critical operations
- **Reentrancy Protection**: All state-changing functions protected
- **Input Validation**: Comprehensive parameter validation
- **Chain Verification**: Cross-chain message verification
- **Rate Limiting**: Built-in protection against spam

## 📚 Additional Resources

- [Chainlink VRF Documentation](https://docs.chain.link/vrf/v2/introduction)
- [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Foundry Book](https://book.getfoundry.sh/)

## 🐛 Troubleshooting

### Common Issues

1. **Stack Too Deep Error**: Ensure `via_ir = true` in foundry.toml
2. **VRF Subscription**: Verify subscription is funded and active
3. **Cross-Chain Allowlist**: Ensure destination chains are allowlisted
4. **Gas Estimation**: Increase gas limit for complex transactions

### Getting Help

- Check the test files for usage examples
- Review contract events for debugging
- Use `forge test -vvv` for detailed test output
- Verify network configuration in foundry.toml

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.
