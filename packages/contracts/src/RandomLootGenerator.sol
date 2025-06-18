// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LootManager} from "./LootManager.sol";

/**
 * @title RandomLootGenerator
 * @dev Generates random loot using Chainlink VRF v2
 * Provides truly random loot generation for the dungeon crawler game
 */
contract RandomLootGenerator is VRFConsumerBaseV2, ConfirmedOwner {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event LootGenerated(address indexed player, uint256 indexed lootId, string lootName, uint256 rarity);

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
        address player;
        uint256 dungeonLevel;
    }

    // VRF Configuration
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c; // Sepolia key hash
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 3; // Generate 3 random numbers for loot attributes

    mapping(uint256 => RequestStatus) public s_requests;
    uint256[] public requestIds;
    uint256 public lastRequestId;

    LootManager public lootManager;

    // Loot rarities and their probabilities (out of 10000)
    uint256 public constant COMMON_THRESHOLD = 6000;      // 60% - Common
    uint256 public constant UNCOMMON_THRESHOLD = 8500;    // 25% - Uncommon  
    uint256 public constant RARE_THRESHOLD = 9500;       // 10% - Rare
    uint256 public constant EPIC_THRESHOLD = 9900;       // 4% - Epic
    uint256 public constant LEGENDARY_THRESHOLD = 10000; // 1% - Legendary

    // Loot types
    string[] private lootTypes = [
        "Weapon",
        "Armor", 
        "Shield",
        "Helmet",
        "Boots",
        "Gloves",
        "Ring",
        "Amulet",
        "Potion",
        "Scroll"
    ];

    // Weapon names by rarity
    string[][] private weaponNames = [
        ["Rusty Sword", "Wooden Club", "Dull Blade", "Broken Axe"],                    // Common
        ["Iron Sword", "Steel Mace", "Silver Dagger", "Enchanted Bow"],               // Uncommon
        ["Flame Blade", "Ice Spear", "Lightning Staff", "Shadow Bow"],                // Rare
        ["Dragon Slayer", "Void Hammer", "Phoenix Sword", "Storm Blade"],             // Epic
        ["Excalibur", "Mjolnir", "Gungnir", "Durandal"]                              // Legendary
    ];

    // Armor names by rarity
    string[][] private armorNames = [
        ["Cloth Robe", "Leather Vest", "Torn Cloak", "Padded Armor"],                 // Common
        ["Chain Mail", "Scale Armor", "Studded Leather", "Iron Plate"],               // Uncommon
        ["Mithril Chain", "Dragon Scale", "Enchanted Robe", "Crystal Armor"],         // Rare
        ["Divine Plate", "Shadow Mail", "Phoenix Scale", "Void Armor"],               // Epic
        ["Armor of Gods", "Celestial Mail", "Eternal Plate", "Cosmic Armor"]          // Legendary
    ];

    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        address _lootManager
    ) VRFConsumerBaseV2(vrfCoordinator) ConfirmedOwner(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        lootManager = LootManager(_lootManager);
    }

    /**
     * @dev Request random loot generation for a player
     * @param player The player address
     * @param dungeonLevel The current dungeon level (affects loot quality)
     */
    function requestRandomLoot(address player, uint256 dungeonLevel) external returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false,
            player: player,
            dungeonLevel: dungeonLevel
        });
        
        requestIds.push(requestId);
        lastRequestId = requestId;
        
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    /**
     * @dev Callback function used by VRF Coordinator
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].exists, "Request not found");
        
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        
        // Generate loot based on random words
        _generateLoot(_requestId, _randomWords);
        
        emit RequestFulfilled(_requestId, _randomWords);
    }

    /**
     * @dev Generate loot based on random words
     */
    function _generateLoot(uint256 requestId, uint256[] memory randomWords) private {
        RequestStatus memory request = s_requests[requestId];
        
        // Use first random word for rarity (modified by dungeon level)
        uint256 rarityRoll = (randomWords[0] % 10000) + (request.dungeonLevel * 50); // Higher level = better loot
        if (rarityRoll > 10000) rarityRoll = 10000;
        
        uint256 rarity = _determineRarity(rarityRoll);
        
        // Use second random word for loot type
        uint256 typeIndex = randomWords[1] % lootTypes.length;
        string memory lootType = lootTypes[typeIndex];
        
        // Use third random word for specific item within type
        string memory lootName = _generateLootName(lootType, rarity, randomWords[2]);
        
        // Calculate power based on rarity and dungeon level
        uint256 basePower = (rarity + 1) * 10;
        uint256 power = basePower + (request.dungeonLevel * 2) + (randomWords[0] % 20);
        
        // Generate attributes
        string[] memory attributes = _generateAttributes(randomWords, rarity);
        
        // Mint the loot
        uint256 lootId = lootManager.mintLoot(
            request.player,
            lootName,
            lootType,
            rarity,
            power,
            attributes
        );
        
        emit LootGenerated(request.player, lootId, lootName, rarity);
    }

    /**
     * @dev Determine rarity based on roll
     */
    function _determineRarity(uint256 roll) private pure returns (uint256) {
        if (roll < COMMON_THRESHOLD) return 0;      // Common
        if (roll < UNCOMMON_THRESHOLD) return 1;    // Uncommon
        if (roll < RARE_THRESHOLD) return 2;        // Rare
        if (roll < EPIC_THRESHOLD) return 3;        // Epic
        return 4;                                   // Legendary
    }

    /**
     * @dev Generate loot name based on type and rarity
     */
    function _generateLootName(string memory lootType, uint256 rarity, uint256 randomSeed) 
        private 
        view 
        returns (string memory) 
    {
        if (keccak256(bytes(lootType)) == keccak256(bytes("Weapon"))) {
            uint256 nameIndex = randomSeed % weaponNames[rarity].length;
            return weaponNames[rarity][nameIndex];
        } else if (keccak256(bytes(lootType)) == keccak256(bytes("Armor"))) {
            uint256 nameIndex = randomSeed % armorNames[rarity].length;
            return armorNames[rarity][nameIndex];
        } else {
            // For other types, generate a name with rarity prefix
            string memory rarityPrefix = _getRarityPrefix(rarity);
            return string(abi.encodePacked(rarityPrefix, " ", lootType));
        }
    }

    /**
     * @dev Get rarity prefix for naming
     */
    function _getRarityPrefix(uint256 rarity) private pure returns (string memory) {
        if (rarity == 0) return "Common";
        if (rarity == 1) return "Uncommon";
        if (rarity == 2) return "Rare";
        if (rarity == 3) return "Epic";
        return "Legendary";
    }

    /**
     * @dev Generate attributes for loot
     */
    function _generateAttributes(uint256[] memory randomWords, uint256 rarity) 
        private 
        pure 
        returns (string[] memory) 
    {
        uint256 numAttributes = 1 + (rarity / 2); // More attributes for higher rarity
        string[] memory attributes = new string[](numAttributes);
        
        string[] memory possibleAttributes = new string[](8);
        possibleAttributes[0] = "Strength";
        possibleAttributes[1] = "Dexterity";
        possibleAttributes[2] = "Intelligence";
        possibleAttributes[3] = "Vitality";
        possibleAttributes[4] = "Fire Resistance";
        possibleAttributes[5] = "Ice Resistance";
        possibleAttributes[6] = "Lightning Resistance";
        possibleAttributes[7] = "Magic Find";
        
        for (uint256 i = 0; i < numAttributes; i++) {
            uint256 attrIndex = (randomWords[i % randomWords.length] + i) % possibleAttributes.length;
            uint256 attrValue = 1 + ((randomWords[i % randomWords.length] % 20) * (rarity + 1));
            attributes[i] = string(abi.encodePacked(
                possibleAttributes[attrIndex],
                " +",
                _toString(attrValue)
            ));
        }
        
        return attributes;
    }

    /**
     * @dev Convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Get request status
     */
    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "Request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    /**
     * @dev Update VRF parameters
     */
    function updateVRFConfig(
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) external onlyOwner {
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    /**
     * @dev Update subscription ID
     */
    function updateSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        s_subscriptionId = _subscriptionId;
    }
}
