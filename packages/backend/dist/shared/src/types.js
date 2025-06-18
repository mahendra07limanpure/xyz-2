"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPERIENCE_PER_LEVEL = exports.MAX_DUNGEON_DEPTH = exports.MIN_PARTY_SIZE = exports.MAX_PARTY_SIZE = exports.SUPPORTED_CHAINS = exports.ErrorCode = exports.MessageType = exports.EventType = exports.PersonalityType = exports.LootType = exports.LendingStatus = exports.Rarity = exports.EquipmentType = exports.TargetType = exports.EnemyType = exports.RoomType = exports.DungeonStatus = exports.PartyRole = exports.PartyStatus = void 0;
var PartyStatus;
(function (PartyStatus) {
    PartyStatus["FORMING"] = "forming";
    PartyStatus["ACTIVE"] = "active";
    PartyStatus["IN_DUNGEON"] = "in_dungeon";
    PartyStatus["COMPLETED"] = "completed";
    PartyStatus["DISBANDED"] = "disbanded";
})(PartyStatus || (exports.PartyStatus = PartyStatus = {}));
var PartyRole;
(function (PartyRole) {
    PartyRole["LEADER"] = "leader";
    PartyRole["MEMBER"] = "member";
})(PartyRole || (exports.PartyRole = PartyRole = {}));
var DungeonStatus;
(function (DungeonStatus) {
    DungeonStatus["ACTIVE"] = "active";
    DungeonStatus["COMPLETED"] = "completed";
    DungeonStatus["FAILED"] = "failed";
})(DungeonStatus || (exports.DungeonStatus = DungeonStatus = {}));
var RoomType;
(function (RoomType) {
    RoomType["COMBAT"] = "combat";
    RoomType["TREASURE"] = "treasure";
    RoomType["BOSS"] = "boss";
    RoomType["EVENT"] = "event";
    RoomType["REST"] = "rest";
})(RoomType || (exports.RoomType = RoomType = {}));
var EnemyType;
(function (EnemyType) {
    EnemyType["GOBLIN"] = "goblin";
    EnemyType["ORC"] = "orc";
    EnemyType["SKELETON"] = "skeleton";
    EnemyType["WIZARD"] = "wizard";
    EnemyType["DRAGON"] = "dragon";
    EnemyType["BOSS"] = "boss";
})(EnemyType || (exports.EnemyType = EnemyType = {}));
var TargetType;
(function (TargetType) {
    TargetType["SELF"] = "self";
    TargetType["ALLY"] = "ally";
    TargetType["ENEMY"] = "enemy";
    TargetType["ALL_ALLIES"] = "all_allies";
    TargetType["ALL_ENEMIES"] = "all_enemies";
})(TargetType || (exports.TargetType = TargetType = {}));
var EquipmentType;
(function (EquipmentType) {
    EquipmentType["WEAPON"] = "weapon";
    EquipmentType["ARMOR"] = "armor";
    EquipmentType["ACCESSORY"] = "accessory";
    EquipmentType["CONSUMABLE"] = "consumable";
})(EquipmentType || (exports.EquipmentType = EquipmentType = {}));
var Rarity;
(function (Rarity) {
    Rarity["COMMON"] = "common";
    Rarity["UNCOMMON"] = "uncommon";
    Rarity["RARE"] = "rare";
    Rarity["EPIC"] = "epic";
    Rarity["LEGENDARY"] = "legendary";
    Rarity["MYTHIC"] = "mythic";
})(Rarity || (exports.Rarity = Rarity = {}));
var LendingStatus;
(function (LendingStatus) {
    LendingStatus["AVAILABLE"] = "available";
    LendingStatus["ACTIVE"] = "active";
    LendingStatus["COMPLETED"] = "completed";
    LendingStatus["DEFAULTED"] = "defaulted";
    LendingStatus["CANCELLED"] = "cancelled";
})(LendingStatus || (exports.LendingStatus = LendingStatus = {}));
var LootType;
(function (LootType) {
    LootType["EQUIPMENT"] = "equipment";
    LootType["CURRENCY"] = "currency";
    LootType["CONSUMABLE"] = "consumable";
    LootType["MATERIAL"] = "material";
})(LootType || (exports.LootType = LootType = {}));
var PersonalityType;
(function (PersonalityType) {
    PersonalityType["BRAVE"] = "brave";
    PersonalityType["CAUTIOUS"] = "cautious";
    PersonalityType["WISE"] = "wise";
    PersonalityType["AGGRESSIVE"] = "aggressive";
    PersonalityType["SUPPORTIVE"] = "supportive";
    PersonalityType["MYSTERIOUS"] = "mysterious";
})(PersonalityType || (exports.PersonalityType = PersonalityType = {}));
var EventType;
(function (EventType) {
    EventType["TREASURE_CHEST"] = "treasure_chest";
    EventType["TRAP"] = "trap";
    EventType["NPC_ENCOUNTER"] = "npc_encounter";
    EventType["PUZZLE"] = "puzzle";
    EventType["SHRINE"] = "shrine";
})(EventType || (exports.EventType = EventType = {}));
var MessageType;
(function (MessageType) {
    MessageType["PARTY_UPDATE"] = "party_update";
    MessageType["PARTY_MEMBER_JOIN"] = "party_member_join";
    MessageType["PARTY_MEMBER_LEAVE"] = "party_member_leave";
    MessageType["PARTY_DISBANDED"] = "party_disbanded";
    MessageType["DUNGEON_UPDATE"] = "dungeon_update";
    MessageType["ROOM_ENTERED"] = "room_entered";
    MessageType["COMBAT_START"] = "combat_start";
    MessageType["COMBAT_ACTION"] = "combat_action";
    MessageType["COMBAT_END"] = "combat_end";
    MessageType["LOOT_FOUND"] = "loot_found";
    MessageType["CHAT_MESSAGE"] = "chat_message";
    MessageType["AI_DIALOGUE"] = "ai_dialogue";
    MessageType["PLAYER_ONLINE"] = "player_online";
    MessageType["PLAYER_OFFLINE"] = "player_offline";
    MessageType["ERROR"] = "error";
    MessageType["HEARTBEAT"] = "heartbeat";
})(MessageType || (exports.MessageType = MessageType = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["BLOCKCHAIN_ERROR"] = "BLOCKCHAIN_ERROR";
    ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    ErrorCode["PARTY_FULL"] = "PARTY_FULL";
    ErrorCode["ALREADY_IN_PARTY"] = "ALREADY_IN_PARTY";
    ErrorCode["EQUIPMENT_NOT_AVAILABLE"] = "EQUIPMENT_NOT_AVAILABLE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
exports.SUPPORTED_CHAINS = [1, 137, 42161];
exports.MAX_PARTY_SIZE = 8;
exports.MIN_PARTY_SIZE = 2;
exports.MAX_DUNGEON_DEPTH = 50;
exports.EXPERIENCE_PER_LEVEL = 1000;
//# sourceMappingURL=types.js.map