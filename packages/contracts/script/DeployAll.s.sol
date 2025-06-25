// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import "../src/LootManager.sol";
import "../src/PartyRegistry.sol";
import "../src/RandomLootGenerator.sol";
import "../src/CrossChainLootManager.sol";

contract DeployAllContracts is Script {
    // Sepolia network addresses
    address constant SEPOLIA_VRF_COORDINATOR = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    bytes32 constant SEPOLIA_KEY_HASH = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    address constant SEPOLIA_CCIP_ROUTER = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
    address constant SEPOLIA_LINK_TOKEN = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    
    function setUp() public {}

    function run() public {
        console.log("Deploying contracts on Sepolia...");
        uint256 deployerPrivateKey = uint256(vm.envBytes32("PRIVATE_KEY")); // ✅ CORRECT
        uint64 subscriptionId = uint64(vm.envUint("VRF_SUBSCRIPTION_ID"));
        
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        // Deploy PartyRegistry
        console.log("Deploying PartyRegistry...");
        PartyRegistry partyRegistry = new PartyRegistry(deployer);
        console.log("PartyRegistry deployed at:", address(partyRegistry));

        // Deploy LootManager
        console.log("Deploying LootManager...");
        LootManager lootManager = new LootManager(
            SEPOLIA_VRF_COORDINATOR,
            subscriptionId,
            SEPOLIA_KEY_HASH,
            100000, // callback gas limit
            deployer
        );
        console.log("LootManager deployed at:", address(lootManager));

        // Deploy RandomLootGenerator
        console.log("Deploying RandomLootGenerator...");
        RandomLootGenerator randomLootGenerator = new RandomLootGenerator(
            subscriptionId,
            SEPOLIA_VRF_COORDINATOR,
            address(lootManager)
        );
        console.log("RandomLootGenerator deployed at:", address(randomLootGenerator));

        // Deploy CrossChainLootManager
        console.log("Deploying CrossChainLootManager...");
        CrossChainLootManager crossChainLootManager = new CrossChainLootManager(
            SEPOLIA_CCIP_ROUTER,
            SEPOLIA_LINK_TOKEN,
            address(lootManager)
        );
        console.log("CrossChainLootManager deployed at:", address(crossChainLootManager));

        vm.stopBroadcast();

        // Output deployment addresses
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network Chain ID:", block.chainid);
        console.log("PartyRegistry:", address(partyRegistry));
        console.log("LootManager:", address(lootManager));
        console.log("RandomLootGenerator:", address(randomLootGenerator));
        console.log("CrossChainLootManager:", address(crossChainLootManager));
        console.log("VRF Subscription ID:", subscriptionId);
        console.log("============================\n");
        
        // Output environment variables for easy copy-paste
        console.log("=== ENVIRONMENT VARIABLES ===");
        console.log("PARTY_REGISTRY_ADDRESS=", address(partyRegistry));
        console.log("LOOT_MANAGER_ADDRESS=", address(lootManager));
        console.log("RANDOM_LOOT_GENERATOR_ADDRESS=", address(randomLootGenerator));
        console.log("CROSS_CHAIN_LOOT_MANAGER_ADDRESS=", address(crossChainLootManager));
        console.log("==============================\n");
    }
}
