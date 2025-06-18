// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "../lib/chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

/**
 * @title LootManager
 * @dev Manages loot generation, distribution, and NFT equipment using Chainlink VRF
 */
contract LootManager is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, VRFConsumerBaseV2 {
    uint256 private _tokenIds;
    
    // Chainlink VRF
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 3;
    
    // Equipment types
    enum EquipmentType { WEAPON, ARMOR, ACCESSORY, CONSUMABLE }
    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC }
    
    struct Equipment {
        uint256 tokenId;
        EquipmentType equipmentType;
        Rarity rarity;
        string name;
        uint256 attackPower;
        uint256 defensePower;
        uint256 magicPower;
        uint256 durability;
        bool isLendable;
        address originalOwner;
        uint256 createdAt;
    }
    
    struct LootRequest {
        uint256 requestId;
        address player;
        uint256 partyId;
        uint256 dungeonLevel;
        bool fulfilled;
    }
    
    // Mappings
    mapping(uint256 => Equipment) public equipment;
    mapping(uint256 => LootRequest) public lootRequests;
    mapping(address => uint256[]) public playerEquipment;
    mapping(uint256 => address) public equipmentOwner;
    
    // Loot generation probabilities (out of 10000)
    mapping(Rarity => uint256) public rarityProbabilities;
    mapping(EquipmentType => uint256) public typeProbabilities;
    
    // Events
    event LootRequested(uint256 indexed requestId, address indexed player, uint256 partyId);
    event LootGenerated(uint256 indexed tokenId, address indexed player, EquipmentType equipmentType, Rarity rarity);
    event EquipmentCreated(uint256 indexed tokenId, address indexed owner, string name);
    event EquipmentLendingStatusChanged(uint256 indexed tokenId, bool isLendable);
    
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        address initialOwner
    ) 
        ERC721("Dungeon Equipment", "DEQP")
        Ownable(initialOwner)
        VRFConsumerBaseV2(vrfCoordinatorV2)
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        
        _initializeProbabilities();
    }
    
    /**
     * @dev Initialize loot generation probabilities
     */
    function _initializeProbabilities() internal {
        // Rarity probabilities (out of 10000)
        rarityProbabilities[Rarity.COMMON] = 5000;     // 50%
        rarityProbabilities[Rarity.UNCOMMON] = 2500;   // 25%
        rarityProbabilities[Rarity.RARE] = 1500;       // 15%
        rarityProbabilities[Rarity.EPIC] = 750;        // 7.5%
        rarityProbabilities[Rarity.LEGENDARY] = 200;   // 2%
        rarityProbabilities[Rarity.MYTHIC] = 50;       // 0.5%
        
        // Equipment type probabilities (out of 10000)
        typeProbabilities[EquipmentType.WEAPON] = 3500;     // 35%
        typeProbabilities[EquipmentType.ARMOR] = 3500;      // 35%
        typeProbabilities[EquipmentType.ACCESSORY] = 2000;  // 20%
        typeProbabilities[EquipmentType.CONSUMABLE] = 1000; // 10%
    }
    
    /**
     * @dev Request loot generation using Chainlink VRF
     */
    function requestLoot(address player, uint256 partyId, uint256 dungeonLevel) external onlyOwner returns (uint256) {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        
        lootRequests[requestId] = LootRequest({
            requestId: requestId,
            player: player,
            partyId: partyId,
            dungeonLevel: dungeonLevel,
            fulfilled: false
        });
        
        emit LootRequested(requestId, player, partyId);
        return requestId;
    }
    
    /**
     * @dev Chainlink VRF callback function
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        LootRequest storage request = lootRequests[requestId];
        require(!request.fulfilled, "Request already fulfilled");
        
        request.fulfilled = true;
        
        // Generate equipment using random words
        _generateEquipment(request.player, request.dungeonLevel, randomWords);
    }
    
    /**
     * @dev Generate equipment based on random values
     */
    function _generateEquipment(address player, uint256 dungeonLevel, uint256[] memory randomWords) internal {
        uint256 typeRandom = randomWords[0] % 10000;
        uint256 rarityRandom = randomWords[1] % 10000;
        uint256 statsRandom = randomWords[2];
        
        EquipmentType equipType = _determineEquipmentType(typeRandom);
        Rarity rarity = _determineRarity(rarityRandom, dungeonLevel);
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        // Generate stats based on rarity and dungeon level
        (uint256 attackPower, uint256 defensePower, uint256 magicPower) = _generateStats(
            equipType, 
            rarity, 
            dungeonLevel, 
            statsRandom
        );
        
        string memory itemName = _generateItemName(equipType, rarity, statsRandom);
        
        equipment[newTokenId] = Equipment({
            tokenId: newTokenId,
            equipmentType: equipType,
            rarity: rarity,
            name: itemName,
            attackPower: attackPower,
            defensePower: defensePower,
            magicPower: magicPower,
            durability: 100,
            isLendable: false,
            originalOwner: player,
            createdAt: block.timestamp
        });
        
        _safeMint(player, newTokenId);
        playerEquipment[player].push(newTokenId);
        equipmentOwner[newTokenId] = player;
        
        emit EquipmentCreated(newTokenId, player, itemName);
        emit LootGenerated(newTokenId, player, equipType, rarity);
    }
    
    /**
     * @dev Determine equipment type based on random value
     */
    function _determineEquipmentType(uint256 randomValue) internal view returns (EquipmentType) {
        uint256 cumulative = 0;
        
        for (uint256 i = 0; i < 4; i++) {
            EquipmentType equipType = EquipmentType(i);
            cumulative += typeProbabilities[equipType];
            if (randomValue < cumulative) {
                return equipType;
            }
        }
        return EquipmentType.WEAPON; // Fallback
    }
    
    /**
     * @dev Determine rarity based on random value and dungeon level
     */
    function _determineRarity(uint256 randomValue, uint256 dungeonLevel) internal view returns (Rarity) {
        // Higher dungeon levels increase chances of better loot
        uint256 levelBonus = (dungeonLevel * 100); // 1% per level bonus for higher rarities
        
        uint256 cumulative = 0;
        
        // Check from highest rarity to lowest
        for (int256 i = 5; i >= 0; i--) {
            Rarity rarity = Rarity(uint256(i));
            uint256 probability = rarityProbabilities[rarity];
            
            if (i >= 3) { // EPIC, LEGENDARY, MYTHIC get level bonus
                probability += levelBonus;
            }
            
            cumulative += probability;
            if (randomValue < cumulative) {
                return rarity;
            }
        }
        return Rarity.COMMON; // Fallback
    }
    
    /**
     * @dev Generate item stats based on type, rarity, and level
     */
    function _generateStats(
        EquipmentType equipType, 
        Rarity rarity, 
        uint256 dungeonLevel, 
        uint256 randomSeed
    ) internal pure returns (uint256 attackPower, uint256 defensePower, uint256 magicPower) {
        uint256 basePower = (dungeonLevel * 10) + (uint256(rarity) * 20) + 10;
        uint256 variance = (randomSeed % 21) + 90; // 90-110% of base
        
        basePower = (basePower * variance) / 100;
        
        if (equipType == EquipmentType.WEAPON) {
            attackPower = basePower;
            defensePower = basePower / 4;
            magicPower = basePower / 2;
        } else if (equipType == EquipmentType.ARMOR) {
            attackPower = basePower / 4;
            defensePower = basePower;
            magicPower = basePower / 3;
        } else if (equipType == EquipmentType.ACCESSORY) {
            attackPower = basePower / 3;
            defensePower = basePower / 3;
            magicPower = basePower;
        } else { // CONSUMABLE
            attackPower = basePower / 2;
            defensePower = basePower / 2;
            magicPower = basePower / 2;
        }
    }
    
    /**
     * @dev Generate item name based on properties
     */
    function _generateItemName(
        EquipmentType equipType, 
        Rarity rarity, 
        uint256 randomSeed
    ) internal pure returns (string memory) {
        string[6] memory rarityPrefixes = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
        string[4] memory typeNames = ["Sword", "Armor", "Ring", "Potion"];
        
        uint256 suffixIndex = randomSeed % 5;
        string[5] memory suffixes = ["of Power", "of Protection", "of Wisdom", "of Speed", "of Fortune"];
        
        return string(abi.encodePacked(
            rarityPrefixes[uint256(rarity)], 
            " ", 
            typeNames[uint256(equipType)],
            " ",
            suffixes[suffixIndex]
        ));
    }
    
    /**
     * @dev Set equipment lending status
     */
    function setLendingStatus(uint256 tokenId, bool isLendable) external {
        require(ownerOf(tokenId) == msg.sender, "Not equipment owner");
        equipment[tokenId].isLendable = isLendable;
        emit EquipmentLendingStatusChanged(tokenId, isLendable);
    }
    
    /**
     * @dev Get equipment details
     */
    function getEquipment(uint256 tokenId) external view returns (Equipment memory) {
        return equipment[tokenId];
    }
    
    /**
     * @dev Get player's equipment
     */
    function getPlayerEquipment(address player) external view returns (uint256[] memory) {
        return playerEquipment[player];
    }
    
    /**
     * @dev Override required functions
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
