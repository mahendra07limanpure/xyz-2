// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import "../src/LootManager.sol";
import "../src/PartyRegistry.sol";

contract DeployBasicContracts is Script {
    // Sepolia network addresses
    address constant SEPOLIA_VRF_COORDINATOR = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    bytes32 constant SEPOLIA_KEY_HASH = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
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

        vm.stopBroadcast();

        // Output deployment addresses
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network Chain ID:", block.chainid);
        console.log("PartyRegistry:", address(partyRegistry));
        console.log("LootManager:", address(lootManager));
        console.log("VRF Subscription ID:", subscriptionId);
        console.log("============================\n");
    }
}
