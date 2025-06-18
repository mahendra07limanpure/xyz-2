// Shared types and interfaces for Cross-Chain AI Dungeon Crawler

// Player types
export interface Player {
  id: string;
  walletAddress: string;
  username?: string;
  level: number;
  experience: number;
  currentPartyId?: string;
  chainId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStats {
  level: number;
  experience: number;
  health: number;
  mana: number;
  attackPower: number;
  defensePower: number;
  magicPower: number;
}

// Party types
export interface Party {
  id: string;
  name?: string;
  leaderId: string;
  members: PartyMember[];
  maxSize: number;
  createdChainId: number;
  status: PartyStatus;
  currentDungeonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartyMember {
  playerId: string;
  walletAddress: string;
  chainId: number;
  role: PartyRole;
  joinedAt: Date;
  isOnline: boolean;
}

export enum PartyStatus {
  FORMING = 'forming',
  ACTIVE = 'active',
  IN_DUNGEON = 'in_dungeon',
  COMPLETED = 'completed',
  DISBANDED = 'disbanded'
}

export enum PartyRole {
  LEADER = 'leader',
  MEMBER = 'member'
}

// Dungeon types
export interface Dungeon {
  id: string;
  partyId: string;
  seed: string;
  depth: number;
  currentRoom: number;
  totalRooms: number;
  status: DungeonStatus;
  rooms: DungeonRoom[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DungeonRoom {
  id: string;
  roomNumber: number;
  roomType: RoomType;
  layout: RoomLayout;
  enemies: Enemy[];
  loot: LootItem[];
  isCompleted: boolean;
  events?: RoomEvent[];
}

export enum DungeonStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum RoomType {
  COMBAT = 'combat',
  TREASURE = 'treasure',
  BOSS = 'boss',
  EVENT = 'event',
  REST = 'rest'
}

export interface RoomLayout {
  width: number;
  height: number;
  walls: Position[];
  doors: Position[];
  spawns: Position[];
}

export interface Position {
  x: number;
  y: number;
}

// Combat types
export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  level: number;
  health: number;
  maxHealth: number;
  attackPower: number;
  defensePower: number;
  magicPower: number;
  abilities: Ability[];
  position: Position;
  isAlive: boolean;
}

export enum EnemyType {
  GOBLIN = 'goblin',
  ORC = 'orc',
  SKELETON = 'skeleton',
  WIZARD = 'wizard',
  DRAGON = 'dragon',
  BOSS = 'boss'
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  damage: number;
  manaCost: number;
  cooldown: number;
  targetType: TargetType;
}

export enum TargetType {
  SELF = 'self',
  ALLY = 'ally',
  ENEMY = 'enemy',
  ALL_ALLIES = 'all_allies',
  ALL_ENEMIES = 'all_enemies'
}

// Equipment types
export interface Equipment {
  id: string;
  tokenId: number;
  name: string;
  description?: string;
  equipmentType: EquipmentType;
  rarity: Rarity;
  stats: EquipmentStats;
  durability: number;
  maxDurability: number;
  isLendable: boolean;
  ownerId: string;
  originalOwnerId: string;
  chainId: number;
  contractAddress: string;
  metadata?: EquipmentMetadata;
  createdAt: Date;
}

export enum EquipmentType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable'
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface EquipmentStats {
  attackPower: number;
  defensePower: number;
  magicPower: number;
  healthBonus?: number;
  manaBonus?: number;
  speedBonus?: number;
}

export interface EquipmentMetadata {
  image?: string;
  animationUrl?: string;
  attributes: MetadataAttribute[];
}

export interface MetadataAttribute {
  traitType: string;
  value: string | number;
  displayType?: string;
}

// Lending types
export interface LendingOffer {
  id: string;
  equipmentId: string;
  lenderId: string;
  borrowerId?: string;
  collateralAmount: bigint;
  rentalFee: bigint;
  duration: number; // in seconds
  status: LendingStatus;
  chainId: number;
  contractAddress: string;
  transactionHash?: string;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
}

export enum LendingStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled'
}

// Loot types
export interface LootItem {
  id: string;
  name: string;
  type: LootType;
  rarity: Rarity;
  quantity: number;
  value: number;
  isEquipment: boolean;
  equipmentId?: string;
}

export enum LootType {
  EQUIPMENT = 'equipment',
  CURRENCY = 'currency',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material'
}

// AI/NPC types
export interface AICompanion {
  id: string;
  playerId: string;
  name: string;
  personalityType: PersonalityType;
  level: number;
  stats: PlayerStats;
  dialogueHistory: DialogueEntry[];
  preferences: CompanionPreferences;
  createdAt: Date;
}

export enum PersonalityType {
  BRAVE = 'brave',
  CAUTIOUS = 'cautious',
  WISE = 'wise',
  AGGRESSIVE = 'aggressive',
  SUPPORTIVE = 'supportive',
  MYSTERIOUS = 'mysterious'
}

export interface DialogueEntry {
  id: string;
  message: string;
  speaker: string; // 'player' or 'companion'
  context?: DialogueContext;
  timestamp: Date;
}

export interface DialogueContext {
  location?: string;
  situation?: string;
  mood?: string;
  recentEvents?: string[];
}

export interface CompanionPreferences {
  preferredCombatStyle: string;
  favoriteEquipmentTypes: EquipmentType[];
  personalityTraits: string[];
  learningData: Record<string, any>;
}

// Room events
export interface RoomEvent {
  id: string;
  type: EventType;
  description: string;
  choices?: EventChoice[];
  outcome?: EventOutcome;
  isCompleted: boolean;
}

export enum EventType {
  TREASURE_CHEST = 'treasure_chest',
  TRAP = 'trap',
  NPC_ENCOUNTER = 'npc_encounter',
  PUZZLE = 'puzzle',
  SHRINE = 'shrine'
}

export interface EventChoice {
  id: string;
  text: string;
  requirements?: string[];
  outcome: EventOutcome;
}

export interface EventOutcome {
  success: boolean;
  rewards?: LootItem[];
  penalties?: string[];
  nextEvent?: string;
  description: string;
}

// API types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: Date;
  fromUserId?: string;
  toUserId?: string;
  roomId?: string;
}

export enum MessageType {
  // Party messages
  PARTY_UPDATE = 'party_update',
  PARTY_MEMBER_JOIN = 'party_member_join',
  PARTY_MEMBER_LEAVE = 'party_member_leave',
  PARTY_DISBANDED = 'party_disbanded',
  
  // Dungeon messages
  DUNGEON_UPDATE = 'dungeon_update',
  ROOM_ENTERED = 'room_entered',
  COMBAT_START = 'combat_start',
  COMBAT_ACTION = 'combat_action',
  COMBAT_END = 'combat_end',
  LOOT_FOUND = 'loot_found',
  
  // Chat messages
  CHAT_MESSAGE = 'chat_message',
  AI_DIALOGUE = 'ai_dialogue',
  
  // System messages
  PLAYER_ONLINE = 'player_online',
  PLAYER_OFFLINE = 'player_offline',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat'
}

// Blockchain types
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    partyRegistry: string;
    lootManager: string;
    lendingPool: string;
    ccipRouter: string;
  };
}

export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}

// Error types
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PARTY_FULL = 'PARTY_FULL',
  ALREADY_IN_PARTY = 'ALREADY_IN_PARTY',
  EQUIPMENT_NOT_AVAILABLE = 'EQUIPMENT_NOT_AVAILABLE'
}

export interface GameError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Game state types
export interface GameState {
  player: Player;
  party: Party | null;
  equipment: Equipment[];
  stats: PlayerStats;
  currentDungeon?: Dungeon;
}

export interface GameStats {
  dungeonsCleared: number;
  totalLoot: number;
  totalExperience: number;
  highestLevel: number;
  gamesPlayed: number;
}

// Constants
export const SUPPORTED_CHAINS = [1, 137, 42161] as const; // Ethereum, Polygon, Arbitrum
export const MAX_PARTY_SIZE = 8;
export const MIN_PARTY_SIZE = 2;
export const MAX_DUNGEON_DEPTH = 50;
export const EXPERIENCE_PER_LEVEL = 1000;

export type SupportedChainId = typeof SUPPORTED_CHAINS[number];
