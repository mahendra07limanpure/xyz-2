import Phaser from 'phaser';
import { GameRegistry } from './GameRegistry';
import { LEVELS, getLevel } from './levels/LevelData';
import { LevelRenderer } from './levels/LevelRenderer';
import { LevelManager } from './levels/LevelManager';
import { socketService } from '../services/socketService';

interface PlayerData {
  id: string;
  x: number;
  y: number;
  wallet: string;
  health: number;
  maxHealth: number;
  level: number;
  isLeader: boolean;
}

interface GameAction {
  type: 'move' | 'attack' | 'loot' | 'cast_spell';
  playerId: string;
  data: any;
  timestamp: number;
}

export class MultiplayerScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private otherPlayers!: Map<string, Phaser.Physics.Arcade.Sprite>;
  private playerData: PlayerData;
  private partyId: string;
  private partyMembers: PlayerData[];
  
  // Game objects
  private enemies!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private loot!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  
  // Level system
  private levelRenderer!: LevelRenderer;
  private levelManager!: LevelManager;
  private currentLevelId: number = 1;
  
  // No custom UI - keep it simple
  
  // Network state
  private lastNetworkUpdate: number = 0;
  private networkUpdateInterval: number = 50; // Update every 50ms
  private actionQueue: GameAction[] = [];
  
  constructor(config: { partyId: string; playerData: PlayerData; partyMembers: PlayerData[] }) {
    super({ key: 'MultiplayerScene' });
    this.partyId = config.partyId;
    this.playerData = config.playerData;
    this.partyMembers = config.partyMembers;
    this.otherPlayers = new Map();
  }

  preload() {
    // Initialize level system
    const initialLevel = getLevel(this.currentLevelId)!;
    this.levelRenderer = new LevelRenderer(this);
    this.levelManager = new LevelManager(this, initialLevel);
    
    // Create sprites for the current level
    this.levelRenderer.createSprites(initialLevel);
    
    // Setup network listeners
    this.setupNetworkListeners();
  }

  create() {
    // Reset player stats to ensure fresh start
    this.resetPlayerStats();
    
    // Get current level
    const currentLevel = this.levelManager.getCurrentLevel();
    const bounds = this.levelManager.getWorldBounds();
    
    // Create world
    this.physics.world.setBounds(0, 0, bounds.width, bounds.height);
    this.physics.world.setFPS(60);
    
    // Create environment
    this.createEnvironment();
    this.createLocalPlayer();
    this.createOtherPlayers();
    this.createEnemies();
    this.createLoot();
    
    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;
    
    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    
    // Start network sync
    this.startNetworkSync();
    
    // Setup physics collisions
    this.setupCollisions();
  }

  private setupNetworkListeners(): void {
    socketService.on('multiplayer:player_move', (data) => {
      this.handlePlayerMove(data);
    });
    
    socketService.on('multiplayer:player_action', (data) => {
      this.handlePlayerAction(data);
    });
    
    socketService.on('multiplayer:player_joined', (data) => {
      this.handlePlayerJoined(data);
    });
    
    socketService.on('multiplayer:player_left', (data) => {
      this.handlePlayerLeft(data);
    });
    
    socketService.on('multiplayer:game_state', (data) => {
      this.handleGameStateUpdate(data);
    });
  }

  private createEnvironment(): void {
    // Create level environment using the level renderer
    const currentLevel = this.levelManager.getCurrentLevel();
    this.walls = this.levelRenderer.renderLevel(currentLevel);
  }

  private createLocalPlayer(): void {
    const startPos = this.levelManager.getPlayerStartPosition();
    
    // Use existing player texture
    this.player = this.physics.add.sprite(startPos.x, startPos.y, 'player-enhanced')
      .setScale(0.8)
      .setDepth(10)
      .setTint(0x00ff00); // Green tint for local player
    
    // Set player properties
    this.player.setCollideWorldBounds(true);
    this.player.setData('playerId', this.playerData.id);
    this.player.setData('isLocal', true);
    
    // Add player name label
    const nameText = this.add.text(0, -40, this.formatPlayerName(this.playerData.wallet), {
      fontSize: '12px',
      color: '#00ff00',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0.5);
    
    this.player.setData('nameText', nameText);
  }

  private createOtherPlayers(): void {
    // Create sprites for other party members
    this.partyMembers.forEach(member => {
      if (member.id !== this.playerData.id) {
        this.createOtherPlayer(member);
      }
    });
  }

  private createOtherPlayer(playerData: PlayerData): void {
    const startPos = this.levelManager.getPlayerStartPosition();
    
    // Use existing player texture
    const otherPlayer = this.physics.add.sprite(
      startPos.x + Math.random() * 100, 
      startPos.y + Math.random() * 100, 
      'player-enhanced'
    )
      .setScale(0.8)
      .setDepth(10)
      .setTint(playerData.isLeader ? 0xffd700 : 0x0080ff); // Gold for leader, blue for others
    
    otherPlayer.setCollideWorldBounds(true);
    otherPlayer.setData('playerId', playerData.id);
    otherPlayer.setData('isLocal', false);
    
    // Add player name label
    const nameText = this.add.text(0, -40, this.formatPlayerName(playerData.wallet), {
      fontSize: '12px',
      color: playerData.isLeader ? '#ffd700' : '#0080ff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0.5);
    
    otherPlayer.setData('nameText', nameText);
    
    this.otherPlayers.set(playerData.id, otherPlayer);
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group();
    
    // Use the level renderer to spawn enemies
    const currentLevel = this.levelManager.getCurrentLevel();
    this.levelRenderer.spawnEnemies(currentLevel, this.enemies);
  }

  private createLoot(): void {
    this.loot = this.physics.add.group();
    
    // Use the level renderer to spawn loot
    const currentLevel = this.levelManager.getCurrentLevel();
    this.levelRenderer.spawnLoot(currentLevel, this.loot);
  }

  private createUI(): void {
    // Simple UI - just essential info
    const infoText = this.add.text(20, 20, `Multiplayer Dungeon - Level ${this.currentLevelId}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 8, y: 4 }
    });
    infoText.setScrollFactor(0);
    
    const controlsText = this.add.text(20, 50, 'WASD/Arrow Keys: Move | Walk into enemies to attack', {
      fontSize: '12px',
      color: '#cccccc',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 6, y: 3 }
    });
    controlsText.setScrollFactor(0);
  }

  private createPartyUI(): void {
    // Simple party member list
    const partyText = this.add.text(600, 20, `Party: ${this.partyMembers.length} members`, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 8, y: 4 }
    });
    partyText.setScrollFactor(0);
  }

  private setupCameraIgnores(): void {
    // Simplified - no special camera setup needed
  }

  private setupCollisions(): void {
    // Player collisions
    this.physics.add.collider(this.player, this.walls);
    
    // Other players collisions
    this.otherPlayers.forEach(player => {
      this.physics.add.collider(player, this.walls);
    });
    
    // Enemy collisions
    this.physics.add.collider(this.enemies, this.walls);
    
    // Player-enemy collisions
    this.physics.add.overlap(this.player, this.enemies, this.handleCombat, undefined, this);
    
    // Player-loot collisions
    this.physics.add.overlap(this.player, this.loot, this.handleLootCollection, undefined, this);
  }

  private startNetworkSync(): void {
    // Send initial position
    this.sendPlayerUpdate();
  }

  update(time: number, delta: number): void {
    this.handleInput();
    this.updatePlayerLabels();
    this.processActionQueue();
    
    // Network sync
    if (time - this.lastNetworkUpdate > this.networkUpdateInterval) {
      this.sendPlayerUpdate();
      this.lastNetworkUpdate = time;
    }
  }

  private handleInput(): void {
    const speed = 200;
    let moved = false;
    
    // Reset velocity
    this.player.setVelocity(0);
    
    // Handle movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setVelocityX(-speed);
      moved = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setVelocityX(speed);
      moved = true;
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.setVelocityY(-speed);
      moved = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.setVelocityY(speed);
      moved = true;
    }
    
    // Send movement update if player moved
    if (moved) {
      this.queueAction({
        type: 'move',
        playerId: this.playerData.id,
        data: { x: this.player.x, y: this.player.y },
        timestamp: Date.now()
      });
    }
  }

  private updatePlayerLabels(): void {
    // Update local player label
    const nameText = this.player.getData('nameText');
    if (nameText) {
      nameText.setPosition(this.player.x, this.player.y - 40);
    }
    
    // Update other players' labels
    this.otherPlayers.forEach(player => {
      const nameText = player.getData('nameText');
      if (nameText) {
        nameText.setPosition(player.x, player.y - 40);
      }
    });
  }

  private queueAction(action: GameAction): void {
    this.actionQueue.push(action);
  }

  private processActionQueue(): void {
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift()!;
      this.sendAction(action);
    }
  }

  private sendPlayerUpdate(): void {
    socketService.sendDungeonAction(this.partyId, 'player_move', {
      playerId: this.playerData.id,
      x: this.player.x,
      y: this.player.y,
      health: this.playerData.health,
      timestamp: Date.now()
    });
  }

  private sendAction(action: GameAction): void {
    socketService.sendDungeonAction(this.partyId, 'player_action', action);
  }

  // Network event handlers
  private handlePlayerMove(data: any): void {
    const { playerId, x, y } = data.payload;
    
    if (playerId === this.playerData.id) return; // Ignore own movements
    
    const otherPlayer = this.otherPlayers.get(playerId);
    if (otherPlayer) {
      // Smoothly interpolate to new position
      this.tweens.add({
        targets: otherPlayer,
        x: x,
        y: y,
        duration: this.networkUpdateInterval,
        ease: 'Linear'
      });
    }
  }

  private handlePlayerAction(data: any): void {
    const action = data.payload as GameAction;
    
    switch (action.type) {
      case 'attack':
        this.handleRemoteAttack(action);
        break;
      case 'loot':
        this.handleRemoteLoot(action);
        break;
      case 'cast_spell':
        this.handleRemoteSpell(action);
        break;
    }
  }

  private handlePlayerJoined(data: any): void {
    const playerData = data.payload as PlayerData;
    if (playerData.id !== this.playerData.id) {
      this.createOtherPlayer(playerData);
    }
  }

  private handlePlayerLeft(data: any): void {
    const { playerId } = data.payload;
    const otherPlayer = this.otherPlayers.get(playerId);
    
    if (otherPlayer) {
      const nameText = otherPlayer.getData('nameText');
      if (nameText) nameText.destroy();
      otherPlayer.destroy();
      this.otherPlayers.delete(playerId);
    }
  }

  private handleGameStateUpdate(data: any): void {
    // Handle shared game state updates (enemies, loot, etc.)
    console.log('Game state update:', data);
  }

  // Game mechanics
  private handleCombat(player: any, enemy: any): void {
    // Check if we're on cooldown
    const now = Date.now();
    const lastAttack = enemy.getData('lastAttackTime') || 0;
    const cooldown = 1000; // 1 second cooldown
    
    if (now - lastAttack < cooldown) {
      return; // Still on cooldown
    }
    
    enemy.setData('lastAttackTime', now);
    
    // Deal damage to enemy
    const damage = 25;
    const currentHealth = enemy.getData('health') || 50;
    const newHealth = Math.max(0, currentHealth - damage);
    enemy.setData('health', newHealth);
    
    // Visual feedback for damage
    enemy.setTint(0xff6666); // Red tint for damage
    this.time.delayedCall(200, () => {
      if (enemy.active) {
        enemy.clearTint();
      }
    });
    
    // Create damage text
    const damageText = this.add.text(enemy.x, enemy.y - 30, `-${damage}`, {
      fontSize: '16px',
      color: '#ff0000'
    });
    
    this.tweens.add({
      targets: damageText,
      y: enemy.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        damageText.destroy();
      }
    });
    
    // Check if enemy is dead
    if (newHealth <= 0) {
      // Create death effect
      const deathEffect = this.add.circle(enemy.x, enemy.y, 0, 0xff4444);
      this.tweens.add({
        targets: deathEffect,
        radius: 30,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          deathEffect.destroy();
        }
      });
      
      // Remove enemy
      enemy.destroy();
      
      // Show experience gain
      const expText = this.add.text(enemy.x, enemy.y - 20, '+50 EXP', {
        fontSize: '14px',
        color: '#00ff00'
      });
      
      this.tweens.add({
        targets: expText,
        y: enemy.y - 50,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          expText.destroy();
        }
      });
    }
    
    // Broadcast to party
    this.queueAction({
      type: 'attack',
      playerId: this.playerData.id,
      data: { 
        enemyId: enemy.getData('id') || `enemy_${enemy.x}_${enemy.y}`, 
        damage: damage,
        newHealth: newHealth,
        enemyX: enemy.x,
        enemyY: enemy.y
      },
      timestamp: Date.now()
    });
  }

  private handleLootCollection(player: any, lootItem: any): void {
    // Get loot data
    const lootValue = lootItem.getData('value') || Math.floor(Math.random() * 100) + 50;
    const lootId = lootItem.getData('id') || `loot_${lootItem.x}_${lootItem.y}`;
    
    // Create collection effect
    const collectEffect = this.add.circle(lootItem.x, lootItem.y, 0, 0xffd700);
    this.tweens.add({
      targets: collectEffect,
      radius: 40,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        collectEffect.destroy();
      }
    });
    
    // Show loot value
    const lootText = this.add.text(lootItem.x, lootItem.y - 30, `+${lootValue} Gold`, {
      fontSize: '14px',
      color: '#ffd700'
    });
    
    this.tweens.add({
      targets: lootText,
      y: lootItem.y - 60,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        lootText.destroy();
      }
    });
    
    // Broadcast to party
    this.queueAction({
      type: 'loot',
      playerId: this.playerData.id,
      data: { 
        lootId: lootId, 
        value: lootValue,
        lootX: lootItem.x,
        lootY: lootItem.y
      },
      timestamp: Date.now()
    });
    
    // Remove loot item
    lootItem.destroy();
  }

  private handleRemoteAttack(action: GameAction): void {
    // Handle attack from another player
    const { enemyId, damage, newHealth, enemyX, enemyY } = action.data;
    
    // Find enemy by position if ID doesn't work
    let targetEnemy: any = null;
    
    this.enemies.children.entries.forEach(enemy => {
      const sprite = enemy as Phaser.Physics.Arcade.Sprite;
      const storedId = sprite.getData('id');
      if (storedId === enemyId || 
          (Math.abs(sprite.x - enemyX) < 10 && Math.abs(sprite.y - enemyY) < 10)) {
        targetEnemy = sprite;
      }
    });
    
    if (targetEnemy) {
      // Update enemy health
      targetEnemy.setData('health', newHealth);
      
      // Show visual feedback
      targetEnemy.setTint(0xff6666); // Red tint for damage
      this.time.delayedCall(200, () => {
        if (targetEnemy.active) {
          targetEnemy.clearTint();
        }
      });
      
      // Create damage text
      const damageText = this.add.text(targetEnemy.x, targetEnemy.y - 30, `-${damage}`, {
        fontSize: '14px',
        color: '#ff8888'
      });
      
      this.tweens.add({
        targets: damageText,
        y: targetEnemy.y - 60,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          damageText.destroy();
        }
      });
      
      // Remove enemy if dead
      if (newHealth <= 0) {
        const deathEffect = this.add.circle(targetEnemy.x, targetEnemy.y, 0, 0xff4444);
        this.tweens.add({
          targets: deathEffect,
          radius: 30,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            deathEffect.destroy();
          }
        });
        
        targetEnemy.destroy();
      }
    }
  }

  private handleRemoteLoot(action: GameAction): void {
    // Handle loot collection from another player
    const { lootId, value, lootX, lootY } = action.data;
    
    // Find loot item by position if ID doesn't work
    let targetLoot: any = null;
    
    this.loot.children.entries.forEach(lootItem => {
      const sprite = lootItem as Phaser.Physics.Arcade.Sprite;
      const storedId = sprite.getData('id');
      if (storedId === lootId || 
          (Math.abs(sprite.x - lootX) < 10 && Math.abs(sprite.y - lootY) < 10)) {
        targetLoot = sprite;
      }
    });
    
    if (targetLoot) {
      // Create collection effect for remote player
      const collectEffect = this.add.circle(targetLoot.x, targetLoot.y, 0, 0xffd700, 0.5);
      this.tweens.add({
        targets: collectEffect,
        radius: 30,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          collectEffect.destroy();
        }
      });
      
      // Show who collected it
      const collectorText = this.add.text(targetLoot.x, targetLoot.y - 20, 'Collected by party member', {
        fontSize: '10px',
        color: '#ffdd88'
      });
      
      this.tweens.add({
        targets: collectorText,
        y: targetLoot.y - 40,
        alpha: 0,
        duration: 1200,
        onComplete: () => {
          collectorText.destroy();
        }
      });
      
      // Remove loot
      targetLoot.destroy();
    }
  }

  private handleRemoteSpell(action: GameAction): void {
    // Handle spell casting from another player
    console.log('Remote spell cast:', action);
  }

  // Utility methods
  private formatPlayerName(wallet: string): string {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }

  private resetPlayerStats(): void {
    // Reset player stats if needed
    this.playerData.health = this.playerData.maxHealth;
  }
}
