// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import "../src/LootManager.sol";
import "../src/RandomLootGenerator.sol";
import "../src/CrossChainLootManager.sol";

contract DeployContracts is Script {
    // Sepolia network addresses
    address constant SEPOLIA_VRF_COORDINATOR = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    address constant SEPOLIA_LINK = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant SEPOLIA_CCIP_ROUTER = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
    bytes32 constant SEPOLIA_KEY_HASH = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    
    // Polygon Mumbai network addresses
    address constant MUMBAI_VRF_COORDINATOR = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    address constant MUMBAI_LINK = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant MUMBAI_CCIP_ROUTER = 0x1035CabC275068e0F4b745A29CEDf38E13aF41b1;
    bytes32 constant MUMBAI_KEY_HASH = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint64 subscriptionId = uint64(vm.envUint("VRF_SUBSCRIPTION_ID"));
        
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        // Determine network-specific addresses
        (address vrfCoordinator, address linkToken, address ccipRouter, bytes32 keyHash) = getNetworkAddresses();

        // Deploy LootManager
        console.log("Deploying LootManager...");
        LootManager lootManager = new LootManager(
            vrfCoordinator,
            subscriptionId,
            keyHash,
            100000, // callback gas limit
            deployer
        );
        console.log("LootManager deployed at:", address(lootManager));

        // Deploy RandomLootGenerator
        console.log("Deploying RandomLootGenerator...");
        RandomLootGenerator randomLootGenerator = new RandomLootGenerator(
            subscriptionId,
            vrfCoordinator,
            address(lootManager)
        );
        console.log("RandomLootGenerator deployed at:", address(randomLootGenerator));

        // Deploy CrossChainLootManager
        console.log("Deploying CrossChainLootManager...");
        CrossChainLootManager crossChainLootManager = new CrossChainLootManager(
            ccipRouter,
            linkToken,
            address(lootManager)
        );
        console.log("CrossChainLootManager deployed at:", address(crossChainLootManager));

        // Configure cross-chain permissions
        console.log("Setting up cross-chain permissions...");
        crossChainLootManager.allowlistSender(address(crossChainLootManager), true);
        
        vm.stopBroadcast();

        // Output deployment addresses
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network Chain ID:", block.chainid);
        console.log("LootManager:", address(lootManager));
        console.log("RandomLootGenerator:", address(randomLootGenerator));
        console.log("CrossChainLootManager:", address(crossChainLootManager));
        console.log("VRF Subscription ID:", subscriptionId);
        console.log("============================\n");
    }

    function getNetworkAddresses() internal view returns (address, address, address, bytes32) {
        if (block.chainid == 11155111) { // Sepolia
            return (SEPOLIA_VRF_COORDINATOR, SEPOLIA_LINK, SEPOLIA_CCIP_ROUTER, SEPOLIA_KEY_HASH);
        } else if (block.chainid == 80001) { // Polygon Mumbai
            return (MUMBAI_VRF_COORDINATOR, MUMBAI_LINK, MUMBAI_CCIP_ROUTER, MUMBAI_KEY_HASH);
        } else {
            revert("Unsupported network");
        }
    }
}
