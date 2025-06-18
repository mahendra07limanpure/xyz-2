import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameRegistry } from './GameRegistry';
import { useGame } from '../contexts/GameContext';

// Simple 2D game scene with better visuals
export class Enhanced2DScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private loot!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  
  // UI
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private healthBar!: Phaser.GameObjects.Graphics;
  private manaBar!: Phaser.GameObjects.Graphics;
  
  // Game state
  private playerStats = {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    experience: 0
  };

  private debugMode = false;
  private debugText!: Phaser.GameObjects.Text;
  private miniMap!: Phaser.GameObjects.Graphics;
  private miniMapObjects: any[] = [];
  private combatCooldown = false;

  constructor() {
    super({ key: 'Enhanced2DScene' });
  }

  preload() {
    // Create better sprites using canvas
    this.createEnhancedSprites();
  }

  create() {
    // Create world
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.physics.world.setFPS(60); // Ensure consistent physics
    
    // Create environment
    this.createEnvironment();
    this.createPlayer();
    this.createEnemies();
    this.createLoot();
    
    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;
    
    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    
    // Create UI camera
    this.uiCamera = this.cameras.add(0, 0, 800, 600);
    this.uiCamera.setName('ui');
    this.uiCamera.ignore(this.children.list.filter(child => 
      child !== this.healthBar && child !== this.manaBar
    ));
    
    // Create UI
    this.createUI();
    
    // Setup physics
    this.setupPhysics();
    
    // Debug info
    console.log('Enhanced2DScene created successfully');
  }

  private createEnhancedSprites() {
    const graphics = this.add.graphics();
    
    // Player sprite - knight-like
    graphics.fillStyle(0x4169E1);
    graphics.fillRoundedRect(0, 0, 28, 28, 4);
    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(14, 10, 6); // Helmet
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(10, 20, 8, 8); // Body
    graphics.generateTexture('player-enhanced', 32, 32);
    
    // Enemy sprite - goblin-like
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRoundedRect(2, 2, 28, 28, 4);
    graphics.fillStyle(0xFF4500);
    graphics.fillCircle(16, 12, 8); // Head
    graphics.fillStyle(0xFF0000);
    graphics.fillCircle(12, 10, 2); // Eye
    graphics.fillCircle(20, 10, 2); // Eye
    graphics.generateTexture('enemy-enhanced', 32, 32);
    
    // Wall sprite - stone-like
    graphics.clear();
    graphics.fillStyle(0x696969);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x808080);
    graphics.fillRect(2, 2, 28, 28);
    graphics.fillStyle(0x555555);
    graphics.fillRect(4, 4, 24, 24);
    graphics.generateTexture('wall-enhanced', 32, 32);
    
    // Floor sprite - cobblestone
    graphics.clear();
    graphics.fillStyle(0x2F4F4F);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x374142);
    graphics.fillCircle(8, 8, 3);
    graphics.fillCircle(24, 8, 3);
    graphics.fillCircle(8, 24, 3);
    graphics.fillCircle(24, 24, 3);
    graphics.generateTexture('floor-enhanced', 32, 32);
    
    // Loot sprite - chest
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRoundedRect(4, 8, 24, 16, 2);
    graphics.fillStyle(0xFFD700);
    graphics.fillRoundedRect(6, 10, 20, 12, 2);
    graphics.fillStyle(0xFF8C00);
    graphics.fillRect(14, 12, 4, 8);
    graphics.generateTexture('loot-enhanced', 32, 32);
    
    graphics.destroy();
  }

  private createEnvironment() {
    this.walls = this.physics.add.staticGroup();
    
    // More interesting dungeon layout
    const dungeon = this.generateDungeon(50, 37);
    
    for (let y = 0; y < dungeon.length; y++) {
      for (let x = 0; x < dungeon[y].length; x++) {
        const tileX = x * 32;
        const tileY = y * 32;
        
        if (dungeon[y][x] === 1) {
          const wall = this.physics.add.staticSprite(tileX + 16, tileY + 16, 'wall-enhanced');
          this.walls.add(wall);
        } else {
          this.add.sprite(tileX + 16, tileY + 16, 'floor-enhanced');
        }
      }
    }
  }

  private generateDungeon(width: number, height: number): number[][] {
    // Simple maze generation
    const dungeon = Array(height).fill(null).map(() => Array(width).fill(1));
    
    // Create paths
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        dungeon[y][x] = 0;
        
        // Random path
        if (Math.random() > 0.5 && x < width - 3) {
          dungeon[y][x + 1] = 0;
        }
        if (Math.random() > 0.5 && y < height - 3) {
          dungeon[y + 1][x] = 0;
        }
      }
    }
    
    // Create larger rooms
    for (let i = 0; i < 8; i++) {
      const roomX = Math.floor(Math.random() * (width - 8)) + 4;
      const roomY = Math.floor(Math.random() * (height - 8)) + 4;
      const roomW = Math.floor(Math.random() * 6) + 3;
      const roomH = Math.floor(Math.random() * 6) + 3;
      
      for (let y = roomY; y < roomY + roomH && y < height - 1; y++) {
        for (let x = roomX; x < roomX + roomW && x < width - 1; x++) {
          dungeon[y][x] = 0;
        }
      }
    }
    
    return dungeon;
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(80, 80, 'player-enhanced');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800); // Increased drag for better control
    this.player.setMaxVelocity(160); // Reduced max velocity
    this.player.body.setSize(24, 24); // Better collision detection
    
    // Add a subtle glow effect
    this.player.setTint(0xffffff);
    this.tweens.add({
      targets: this.player,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createEnemies() {
    this.enemies = this.physics.add.group();
    
    // Spawn enemies in different areas
    for (let i = 0; i < 12; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = Phaser.Math.Between(200, 1400);
        y = Phaser.Math.Between(200, 1000);
        attempts++;
      } while (Phaser.Math.Distance.Between(x, y, 80, 80) < 250 && attempts < 20); // Don't spawn near player
      
      const enemy = this.physics.add.sprite(x, y, 'enemy-enhanced');
      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(24, 24); // Better collision detection
      enemy.setDrag(300);
      
      // Add enemy stats
      enemy.setData('health', 30);
      enemy.setData('maxHealth', 30);
      enemy.setData('damage', 15);
      enemy.setData('inCombat', false);
      enemy.setData('combatCooldown', 0);
      
      // Create health bar for enemy
      const healthBar = this.add.graphics();
      enemy.setData('healthBar', healthBar);
      
      // AI movement pattern - less aggressive
      this.tweens.add({
        targets: enemy,
        x: x + Phaser.Math.Between(-80, 80),
        y: y + Phaser.Math.Between(-80, 80),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.enemies.add(enemy);
    }
  }

  private createLoot() {
    this.loot = this.physics.add.group();
    
    // Place loot chests
    for (let i = 0; i < 10; i++) {
      let x, y;
      do {
        x = Phaser.Math.Between(100, 1500);
        y = Phaser.Math.Between(100, 1100);
      } while (Phaser.Math.Distance.Between(x, y, 80, 80) < 150);
      
      const chest = this.physics.add.sprite(x, y, 'loot-enhanced');
      
      // Sparkle effect
      this.tweens.add({
        targets: chest,
        alpha: 0.7,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.loot.add(chest);
    }
  }

  private createUI() {
    // Health bar
    this.healthBar = this.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.updateHealthBar();
    
    // Mana bar
    this.manaBar = this.add.graphics();
    this.manaBar.setScrollFactor(0);
    this.updateManaBar();
    
    // Controls instructions
    const controlsText = this.add.text(20, 80, 
      'Controls: WASD or Arrow Keys to Move\nDefeat enemies and collect loot!', 
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }
    );
    controlsText.setScrollFactor(0);
    controlsText.setAlpha(0.8);
    
    // Stats display
    this.add.text(20, 140, 
      `Level: ${this.playerStats.level} | XP: ${this.playerStats.experience}`, 
      {
        fontSize: '12px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }
    ).setScrollFactor(0);
    
    // Mini-map with actual world representation
    this.miniMap = this.add.graphics();
    this.miniMap.setScrollFactor(0);
    this.createMiniMap();
    
    // Add mini-map label
    this.add.text(665, 155, 'Mini Map', {
      fontSize: '10px',
      color: '#ffffff'
    }).setScrollFactor(0);
    
    // Debug text
    this.debugText = this.add.text(300, 20, '', {
      fontSize: '10px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setScrollFactor(0).setVisible(false);
    
    // Add F1 instruction
    this.add.text(20, 180, 'Press F1 for debug info', {
      fontSize: '10px',
      color: '#888888'
    }).setScrollFactor(0);
  }

  private createMiniMap() {
    const mapX = 650;
    const mapY = 20;
    const mapWidth = 130;
    const mapHeight = 130;
    
    // Clear and setup minimap background
    this.miniMap.clear();
    this.miniMap.fillStyle(0x000000, 0.8);
    this.miniMap.fillRect(mapX, mapY, mapWidth, mapHeight);
    this.miniMap.lineStyle(2, 0xffffff);
    this.miniMap.strokeRect(mapX, mapY, mapWidth, mapHeight);
    
    // Calculate scale factors
    const scaleX = mapWidth / 1600; // World width
    const scaleY = mapHeight / 1200; // World height
    
    // Draw walls on minimap
    this.walls.children.entries.forEach((wall: any) => {
      const miniX = mapX + (wall.x * scaleX);
      const miniY = mapY + (wall.y * scaleY);
      this.miniMap.fillStyle(0x808080);
      this.miniMap.fillRect(miniX - 1, miniY - 1, 2, 2);
    });
    
    // Store minimap info for updates
    this.miniMapObjects = [{
      x: mapX,
      y: mapY,
      width: mapWidth,
      height: mapHeight,
      scaleX,
      scaleY
    }];
  }

  private updateMiniMap() {
    if (this.miniMapObjects.length === 0) return;
    
    const mapInfo = this.miniMapObjects[0];
    const { x: mapX, y: mapY, width: mapWidth, height: mapHeight, scaleX, scaleY } = mapInfo;
    
    // Clear dynamic elements area
    this.miniMap.fillStyle(0x000000, 0.8);
    this.miniMap.fillRect(mapX + 2, mapY + 2, mapWidth - 4, mapHeight - 4);
    
    // Redraw walls
    this.walls.children.entries.forEach((wall: any) => {
      const miniX = mapX + (wall.x * scaleX);
      const miniY = mapY + (wall.y * scaleY);
      this.miniMap.fillStyle(0x808080);
      this.miniMap.fillRect(miniX - 1, miniY - 1, 2, 2);
    });
    
    // Draw player
    const playerMiniX = mapX + (this.player.x * scaleX);
    const playerMiniY = mapY + (this.player.y * scaleY);
    this.miniMap.fillStyle(0x00ff00); // Green for player
    this.miniMap.fillCircle(playerMiniX, playerMiniY, 3);
    
    // Draw enemies
    this.enemies.children.entries.forEach((enemy: any) => {
      const enemyMiniX = mapX + (enemy.x * scaleX);
      const enemyMiniY = mapY + (enemy.y * scaleY);
      this.miniMap.fillStyle(0xff0000); // Red for enemies
      this.miniMap.fillCircle(enemyMiniX, enemyMiniY, 2);
    });
    
    // Draw loot
    this.loot.children.entries.forEach((loot: any) => {
      const lootMiniX = mapX + (loot.x * scaleX);
      const lootMiniY = mapY + (loot.y * scaleY);
      this.miniMap.fillStyle(0xffff00); // Yellow for loot
      this.miniMap.fillCircle(lootMiniX, lootMiniY, 2);
    });
    
    // Draw border
    this.miniMap.lineStyle(2, 0xffffff);
    this.miniMap.strokeRect(mapX, mapY, mapWidth, mapHeight);
  }

  private setupPhysics() {
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handleCombat(enemy as Phaser.Physics.Arcade.Sprite);
    });
    
    this.physics.add.overlap(this.player, this.loot, (player, loot) => {
      this.collectLoot(loot as Phaser.Physics.Arcade.Sprite);
    });
  }

  private handleCombat(enemy: Phaser.Physics.Arcade.Sprite) {
    // Prevent multiple combat triggers and check cooldowns
    if (enemy.getData('inCombat') || this.combatCooldown) return;
    
    const currentTime = this.time.now;
    const lastCombat = enemy.getData('combatCooldown') || 0;
    
    if (currentTime - lastCombat < 1000) return; // 1 second cooldown
    
    enemy.setData('inCombat', true);
    enemy.setData('combatCooldown', currentTime);
    this.combatCooldown = true;
    
    // Push player away from enemy
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    this.player.setVelocity(
      Math.cos(angle) * 150,
      Math.sin(angle) * 150
    );
    
    // Player attacks enemy
    const playerDamage = Phaser.Math.Between(15, 25);
    const enemyHealth = enemy.getData('health') - playerDamage;
    enemy.setData('health', enemyHealth);
    
    // Show damage text
    this.showDamageText(enemy.x, enemy.y - 30, `-${playerDamage}`, 0xff4444);
    
    // Update enemy health bar
    this.updateEnemyHealthBar(enemy);
    
    if (enemyHealth <= 0) {
      // Enemy dies
      this.killEnemy(enemy);
    } else {
      // Enemy counter-attacks
      this.time.delayedCall(500, () => {
        if (enemy && enemy.active) {
          this.enemyAttack(enemy);
        }
      });
    }
    
    // Reset combat flags
    this.time.delayedCall(1500, () => {
      if (enemy && enemy.active) {
        enemy.setData('inCombat', false);
      }
      this.combatCooldown = false;
    });
  }

  private enemyAttack(enemy: Phaser.Physics.Arcade.Sprite) {
    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    if (distance > 100) return; // Too far to attack
    
    const enemyDamage = enemy.getData('damage') || 10;
    this.playerStats.health = Math.max(0, this.playerStats.health - enemyDamage);
    
    // Show damage text
    this.showDamageText(this.player.x, this.player.y - 30, `-${enemyDamage}`, 0xff0000);
    
    // Flash effect on player
    this.tweens.add({
      targets: this.player,
      tint: 0xff0000,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.player.setTint(0xffffff);
      }
    });
    
    // Screen shake
    this.cameras.main.shake(200, 0.01);
    
    this.updateHealthBar();
    
    // Check if player died
    if (this.playerStats.health <= 0) {
      this.gameOver();
    }
  }

  private killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    // Death effect
    this.tweens.add({
      targets: enemy,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        // Remove health bar
        const healthBar = enemy.getData('healthBar');
        if (healthBar) {
          healthBar.destroy();
        }
        enemy.destroy();
        this.gainExperience(25);
      }
    });
    
    // Victory effect
    this.showDamageText(enemy.x, enemy.y, 'DEFEATED!', 0x00ff00);
    
    GameRegistry.events.emit('combat-victory', { experience: 25 });
  }

  private updateEnemyHealthBar(enemy: Phaser.Physics.Arcade.Sprite) {
    const healthBar = enemy.getData('healthBar');
    if (!healthBar) return;
    
    const health = enemy.getData('health');
    const maxHealth = enemy.getData('maxHealth');
    const healthPercent = health / maxHealth;
    
    healthBar.clear();
    
    // Background
    healthBar.fillStyle(0x000000);
    healthBar.fillRect(enemy.x - 16, enemy.y - 40, 32, 4);
    
    // Health fill
    if (healthPercent > 0.6) {
      healthBar.fillStyle(0x00ff00); // Green
    } else if (healthPercent > 0.3) {
      healthBar.fillStyle(0xffff00); // Yellow
    } else {
      healthBar.fillStyle(0xff0000); // Red
    }
    
    healthBar.fillRect(enemy.x - 16, enemy.y - 40, 32 * healthPercent, 4);
    
    // Border
    healthBar.lineStyle(1, 0xffffff);
    healthBar.strokeRect(enemy.x - 16, enemy.y - 40, 32, 4);
  }

  private showDamageText(x: number, y: number, text: string, color: number) {
    const damageText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }

  private gameOver() {
    // Game over screen
    const gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
      fontSize: '32px',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Add restart functionality
    const restartKey = this.input.keyboard!.addKey('R');
    restartKey.on('down', () => {
      this.scene.restart();
    });
  }

  private collectLoot(loot: Phaser.Physics.Arcade.Sprite) {
    // Collect effect
    this.tweens.add({
      targets: loot,
      x: this.player.x,
      y: this.player.y,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => {
        loot.destroy();
      }
    });
    
    GameRegistry.events.emit('loot-collected', {
      type: 'equipment',
      name: 'Treasure Chest',
      rarity: 'uncommon'
    });
  }

  private gainExperience(amount: number) {
    this.playerStats.experience += amount;
    const expNeeded = this.playerStats.level * 100;
    
    if (this.playerStats.experience >= expNeeded) {
      this.levelUp();
    }
  }

  private levelUp() {
    this.playerStats.level++;
    this.playerStats.experience = 0;
    this.playerStats.maxHealth += 10;
    this.playerStats.health = this.playerStats.maxHealth;
    this.playerStats.maxMana += 5;
    this.playerStats.mana = this.playerStats.maxMana;
    
    // Level up effect
    const levelText = this.add.text(this.player.x, this.player.y - 50, 'LEVEL UP!', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: levelText,
      y: this.player.y - 100,
      alpha: 0,
      duration: 2000,
      onComplete: () => levelText.destroy()
    });
    
    this.updateUI();
    GameRegistry.events.emit('player-level-up', {
      level: this.playerStats.level,
      stats: this.playerStats
    });
  }

  private updateHealthBar() {
    this.healthBar.clear();
    // Background
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(20, 20, 200, 16);
    // Health fill
    this.healthBar.fillStyle(0xff0000);
    const healthWidth = (this.playerStats.health / this.playerStats.maxHealth) * 200;
    this.healthBar.fillRect(20, 20, healthWidth, 16);
    // Border
    this.healthBar.lineStyle(1, 0xffffff);
    this.healthBar.strokeRect(20, 20, 200, 16);
    
    // Add text label if not exists
    if (!this.healthBar.getData('label')) {
      const label = this.add.text(20, 4, 'Health', {
        fontSize: '12px',
        color: '#ffffff'
      }).setScrollFactor(0);
      this.healthBar.setData('label', label);
    }
  }

  private updateManaBar() {
    this.manaBar.clear();
    // Background
    this.manaBar.fillStyle(0x333333);
    this.manaBar.fillRect(20, 45, 200, 16);
    // Mana fill
    this.manaBar.fillStyle(0x0066ff);
    const manaWidth = (this.playerStats.mana / this.playerStats.maxMana) * 200;
    this.manaBar.fillRect(20, 45, manaWidth, 16);
    // Border
    this.manaBar.lineStyle(1, 0xffffff);
    this.manaBar.strokeRect(20, 45, 200, 16);
    
    // Add text label if not exists
    if (!this.manaBar.getData('label')) {
      const label = this.add.text(20, 29, 'Mana', {
        fontSize: '12px',
        color: '#ffffff'
      }).setScrollFactor(0);
      this.manaBar.setData('label', label);
    }
  }

  private updateUI() {
    this.updateHealthBar();
    this.updateManaBar();
  }

  update() {
    const speed = 140;
    let velocityX = 0;
    let velocityY = 0;
    
    // Check horizontal movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    }
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }
    
    // Check vertical movement
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }
    
    // Handle diagonal movement - normalize velocity
    if (velocityX !== 0 && velocityY !== 0) {
      const diagonal = speed * 0.707; // sqrt(2) / 2
      velocityX = velocityX > 0 ? diagonal : -diagonal;
      velocityY = velocityY > 0 ? diagonal : -diagonal;
    }
    
    // Apply velocity
    this.player.setVelocity(velocityX, velocityY);
    
    // Update enemy health bars
    this.enemies.children.entries.forEach((enemy: any) => {
      this.updateEnemyHealthBar(enemy);
    });
    
    // Update minimap periodically
    if (this.time.now % 200 < 20) { // Update every ~200ms
      this.updateMiniMap();
    }
    
    // Update debug info
    if (this.debugMode && this.debugText) {
      this.debugText.setText([
        `Player: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`,
        `Velocity: (${this.player.body.velocity.x.toFixed(0)}, ${this.player.body.velocity.y.toFixed(0)})`,
        `Input: X=${velocityX}, Y=${velocityY}`,
        `Health: ${this.playerStats.health}/${this.playerStats.maxHealth}`,
        `Level: ${this.playerStats.level} (XP: ${this.playerStats.experience})`,
        `Enemies: ${this.enemies.children.size}`,
        `Combat Cooldown: ${this.combatCooldown}`
      ].join('\n'));
    }
    
    // Toggle debug mode with F1
    const f1Key = this.input.keyboard!.addKey('F1');
    if (Phaser.Input.Keyboard.JustDown(f1Key)) {
      this.debugMode = !this.debugMode;
      this.debugText.setVisible(this.debugMode);
    }
    
    // Update UI periodically
    if (this.time.now % 100 < 20) { // Update every ~100ms
      this.updateUI();
    }
  }
}