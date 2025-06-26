import Phaser from 'phaser';
import { LevelConfig } from './LevelData';

export class LevelRenderer {
  private scene: Phaser.Scene;
  private walls!: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createSprites(level: LevelConfig) {
    console.log(`Creating sprites for level ${level.id} with theme: ${level.theme}`);
    
    // Get list of textures needed for this level (only dungeon theme)
    const requiredTextures = [
      'player-enhanced',
      `enemy-goblin`, `enemy-orc`, `enemy-skeleton`, `enemy-boss`,
      `wall-dungeon`, `floor-dungeon`, // Only dungeon theme
      'loot-chest', 'loot-rare_chest', 'loot-legendary_chest'
    ];
    
    // Only destroy textures that will be recreated
    const texturesToDestroy = [
      'player-enhanced',
      `enemy-goblin`, `enemy-orc`, `enemy-skeleton`, `enemy-boss`,
      'loot-chest', 'loot-rare_chest', 'loot-legendary_chest',
      'wall-dungeon', 'floor-dungeon' // Only clean up dungeon textures
    ];
    
    // Safely destroy existing textures
    texturesToDestroy.forEach(textureKey => {
      if (this.scene.textures.exists(textureKey)) {
        try {
          this.scene.textures.remove(textureKey);
          console.log(`Removed existing texture: ${textureKey}`);
        } catch (error) {
          console.warn(`Failed to remove texture ${textureKey}:`, error);
        }
      }
    });
    
    try {
      // Create graphics object for texture generation
      const graphics = this.scene.add.graphics();
      
      // Create all textures in order
      console.log('Creating player texture...');
      this.createPlayerSprite(graphics);
      
      console.log('Creating enemy textures...');
      this.createEnemySprites(graphics, level.theme);
      
      console.log(`Creating wall texture for theme: ${level.theme}...`);
      this.createWallSprite(graphics, level.theme);
      
      console.log(`Creating floor texture for theme: ${level.theme}...`);
      this.createFloorSprite(graphics, level.theme);
      
      console.log('Creating loot textures...');
      this.createLootSprites(graphics);
      
      // Clean up graphics object
      graphics.destroy();
      
      // Verify all required textures exist
      const missingTextures = requiredTextures.filter(key => !this.scene.textures.exists(key));
      if (missingTextures.length > 0) {
        console.error('Missing textures after creation:', missingTextures);
        throw new Error(`Failed to create textures: ${missingTextures.join(', ')}`);
      }
      
      console.log(`Successfully created all sprites for level ${level.id} (${level.theme})`, {
        texturesCreated: requiredTextures.length,
        wallTexture: `wall-${level.theme}`,
        floorTexture: `floor-${level.theme}`,
        allTexturesExist: requiredTextures.every(key => this.scene.textures.exists(key))
      });
      
    } catch (error) {
      console.error('Error creating sprites:', error);
      throw error; // Re-throw to handle in calling code
    }
  }

  private createPlayerSprite(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear();
    
    // Ensure graphics is set up properly
    if (!graphics.scene || !graphics.scene.textures) {
      console.error('Graphics object is not properly initialized');
      return;
    }
    
    graphics.fillStyle(0x4169E1);
    graphics.fillRoundedRect(0, 0, 28, 28, 4);
    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(14, 10, 6); // Helmet
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(10, 20, 8, 8); // Body
    
    try {
      graphics.generateTexture('player-enhanced', 32, 32);
      console.log('Player texture created successfully');
    } catch (error) {
      console.error('Failed to create player texture:', error);
      throw error;
    }
  }

  private createEnemySprites(graphics: Phaser.GameObjects.Graphics, theme: string) {
    // Goblin sprite
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRoundedRect(2, 2, 28, 28, 4);
    graphics.fillStyle(0xFF4500);
    graphics.fillCircle(16, 12, 8); // Head
    graphics.fillStyle(0xFF0000);
    graphics.fillCircle(12, 10, 2); // Eye
    graphics.fillCircle(20, 10, 2); // Eye
    graphics.generateTexture('enemy-goblin', 32, 32);

    // Orc sprite (larger, darker)
    graphics.clear();
    graphics.fillStyle(0x654321);
    graphics.fillRoundedRect(1, 1, 30, 30, 4);
    graphics.fillStyle(0x8B0000);
    graphics.fillCircle(16, 12, 10); // Head
    graphics.fillStyle(0xFF0000);
    graphics.fillCircle(12, 9, 3); // Eye
    graphics.fillCircle(20, 9, 3); // Eye
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(14, 18, 4, 6); // Tusk
    graphics.generateTexture('enemy-orc', 32, 32);

    // Skeleton sprite
    graphics.clear();
    graphics.fillStyle(0xF5F5DC);
    graphics.fillRoundedRect(2, 2, 28, 28, 4);
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(16, 12, 8); // Skull
    graphics.fillStyle(0x000000);
    graphics.fillCircle(12, 10, 2); // Eye socket
    graphics.fillCircle(20, 10, 2); // Eye socket
    graphics.fillRect(14, 14, 4, 2); // Nose
    graphics.generateTexture('enemy-skeleton', 32, 32);

    // Boss sprite (much larger)
    graphics.clear();
    graphics.fillStyle(0x800080);
    graphics.fillRoundedRect(0, 0, 32, 32, 6);
    graphics.fillStyle(0xFF0000);
    graphics.fillCircle(16, 14, 12); // Large head
    graphics.fillStyle(0xFFFF00);
    graphics.fillCircle(10, 12, 3); // Glowing eye
    graphics.fillCircle(22, 12, 3); // Glowing eye
    graphics.fillStyle(0x000000);
    graphics.fillRect(12, 20, 8, 8); // Body
    graphics.generateTexture('enemy-boss', 32, 32);
  }

  private createWallSprite(graphics: Phaser.GameObjects.Graphics, theme: string) {
    graphics.clear();
    
    // Ensure graphics is set up properly
    if (!graphics.scene || !graphics.scene.textures) {
      console.error('Graphics object is not properly initialized for wall texture');
      return;
    }
    
    switch (theme) {
      case 'dungeon':
        graphics.fillStyle(0x696969);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x808080);
        graphics.fillRect(2, 2, 28, 28);
        graphics.fillStyle(0x555555);
        graphics.fillRect(4, 4, 24, 24);
        break;
      
      case 'cave':
        graphics.fillStyle(0x2F2F2F);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x404040);
        graphics.fillCircle(8, 8, 6);
        graphics.fillCircle(24, 12, 4);
        graphics.fillCircle(16, 24, 5);
        break;
      
      case 'temple':
        graphics.fillStyle(0x4B0082);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0xFFD700);
        graphics.fillRect(4, 4, 24, 24);
        graphics.fillStyle(0x9932CC);
        graphics.fillRect(8, 8, 16, 16);
        break;
    }
    
    const textureKey = `wall-${theme}`;
    try {
      graphics.generateTexture(textureKey, 32, 32);
      console.log(`Wall texture created successfully: ${textureKey}`);
    } catch (error) {
      console.error(`Failed to create wall texture ${textureKey}:`, error);
      throw error;
    }
  }

  private createFloorSprite(graphics: Phaser.GameObjects.Graphics, theme: string) {
    graphics.clear();
    
    // Ensure graphics is set up properly
    if (!graphics.scene || !graphics.scene.textures) {
      console.error('Graphics object is not properly initialized for floor texture');
      return;
    }
    
    switch (theme) {
      case 'dungeon':
        graphics.fillStyle(0x2F4F4F);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x374142);
        graphics.fillCircle(8, 8, 3);
        graphics.fillCircle(24, 8, 3);
        graphics.fillCircle(8, 24, 3);
        graphics.fillCircle(24, 24, 3);
        break;
      
      case 'cave':
        graphics.fillStyle(0x1C1C1C);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x2A2A2A);
        graphics.fillRect(4, 4, 24, 24);
        graphics.fillStyle(0x333333);
        graphics.fillRect(8, 8, 16, 16);
        break;
      
      case 'temple':
        graphics.fillStyle(0x483D8B);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x6A5ACD);
        graphics.fillRect(2, 2, 28, 28);
        graphics.fillStyle(0xFFD700);
        graphics.fillRect(14, 14, 4, 4);
        break;
    }
    
    const textureKey = `floor-${theme}`;
    try {
      graphics.generateTexture(textureKey, 32, 32);
      console.log(`Floor texture created successfully: ${textureKey}`);
    } catch (error) {
      console.error(`Failed to create floor texture ${textureKey}:`, error);
      throw error;
    }
  }

  private createLootSprites(graphics: Phaser.GameObjects.Graphics) {
    // Regular chest
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRoundedRect(4, 8, 24, 16, 2);
    graphics.fillStyle(0xFFD700);
    graphics.fillRoundedRect(6, 10, 20, 12, 2);
    graphics.fillStyle(0xFF8C00);
    graphics.fillRect(14, 12, 4, 8);
    graphics.generateTexture('loot-chest', 32, 32);

    // Rare chest (silver)
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRoundedRect(4, 8, 24, 16, 2);
    graphics.fillStyle(0xC0C0C0);
    graphics.fillRoundedRect(6, 10, 20, 12, 2);
    graphics.fillStyle(0x87CEEB);
    graphics.fillRect(14, 12, 4, 8);
    graphics.generateTexture('loot-rare_chest', 32, 32);

    // Legendary chest (golden with gems)
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRoundedRect(4, 8, 24, 16, 2);
    graphics.fillStyle(0xFFD700);
    graphics.fillRoundedRect(6, 10, 20, 12, 2);
    graphics.fillStyle(0xFF1493);
    graphics.fillCircle(12, 14, 2);
    graphics.fillCircle(20, 14, 2);
    graphics.fillStyle(0x00FF00);
    graphics.fillCircle(16, 18, 2);
    graphics.generateTexture('loot-legendary_chest', 32, 32);
  }

  renderLevel(level: LevelConfig): Phaser.Physics.Arcade.StaticGroup {
    this.walls = this.scene.physics.add.staticGroup();
    
    console.log(`Rendering level ${level.id} (${level.theme}) with map size ${level.map.length}x${level.map[0].length}`);
    
    // Verify required textures exist before rendering
    const requiredTextures = [`wall-${level.theme}`, `floor-${level.theme}`];
    const missingTextures = requiredTextures.filter(key => !this.scene.textures.exists(key));
    
    if (missingTextures.length > 0) {
      console.error(`Cannot render level - missing textures:`, missingTextures);
      throw new Error(`Missing required textures for level rendering: ${missingTextures.join(', ')}`);
    }
    
    // Set background color
    this.scene.cameras.main.setBackgroundColor(level.backgroundColor);
    
    let wallCount = 0;
    let floorCount = 0;
    
    // Render the map
    for (let y = 0; y < level.map.length; y++) {
      for (let x = 0; x < level.map[y].length; x++) {
        const tileX = x * 32;
        const tileY = y * 32;
        
        if (level.map[y][x] === 1) {
          // Wall tile - verify texture exists before creating sprite
          const wallTextureKey = `wall-${level.theme}`;
          if (!this.scene.textures.exists(wallTextureKey)) {
            console.error(`Wall texture ${wallTextureKey} does not exist!`);
            continue;
          }
          
          const wall = this.scene.physics.add.staticSprite(
            tileX + 16, 
            tileY + 16, 
            wallTextureKey
          );
          wall.setDepth(2); // Walls above floor but below entities
          this.walls.add(wall);
          wallCount++;
        } else {
          // Floor tile - verify texture exists before creating sprite
          const floorTextureKey = `floor-${level.theme}`;
          if (!this.scene.textures.exists(floorTextureKey)) {
            console.error(`Floor texture ${floorTextureKey} does not exist!`);
            continue;
          }
          
          const floor = this.scene.add.sprite(tileX + 16, tileY + 16, floorTextureKey);
          floor.setDepth(0); // Floor at the bottom
          floorCount++;
        }
      }
    }
    
    console.log(`Level ${level.id} rendered successfully: ${wallCount} walls, ${floorCount} floor tiles`);
    return this.walls;
  }

  spawnEnemies(level: LevelConfig, enemyGroup: Phaser.Physics.Arcade.Group): void {
    console.log(`Spawning ${level.enemies.length} enemies for level ${level.id}`);
    
    level.enemies.forEach((enemyData, index) => {
      const textureKey = `enemy-${enemyData.type}`;
      
      // Verify enemy texture exists before creating sprite
      if (!this.scene.textures.exists(textureKey)) {
        console.error(`Enemy texture ${textureKey} does not exist! Skipping enemy ${index}`);
        return;
      }
      
      try {
        const enemy = this.scene.physics.add.sprite(enemyData.x, enemyData.y, textureKey);
        enemy.setCollideWorldBounds(true);
        enemy.body.setSize(24, 24);
        enemy.setDrag(300);
        
        // Set proper depth for enemies
        enemy.setDepth(5);
        enemy.setVisible(true);
        
        // Set enemy stats based on type
        const stats = this.getEnemyStats(enemyData.type);
        enemy.setData('health', stats.health);
        enemy.setData('maxHealth', stats.health);
        enemy.setData('damage', stats.damage);
        enemy.setData('inCombat', false);
        enemy.setData('combatCooldown', 0);
        enemy.setData('type', enemyData.type);
        
        // Create health bar
        const healthBar = this.scene.add.graphics();
        healthBar.setDepth(15); // Health bars above everything
        enemy.setData('healthBar', healthBar);
        
        // Add AI movement
        this.addEnemyAI(enemy, enemyData.type);
        
        enemyGroup.add(enemy);
        console.log(`Created enemy ${enemyData.type} at (${enemyData.x}, ${enemyData.y})`);
        
      } catch (error) {
        console.error(`Failed to create enemy ${enemyData.type}:`, error);
      }
    });
    
    console.log(`Successfully spawned ${enemyGroup.children.size} enemies`);
  }

  spawnLoot(level: LevelConfig, lootGroup: Phaser.Physics.Arcade.Group): void {
    console.log(`Spawning ${level.loot.length} loot items for level ${level.id}`);
    
    level.loot.forEach((lootData, index) => {
      const textureKey = `loot-${lootData.type}`;
      
      // Verify loot texture exists before creating sprite
      if (!this.scene.textures.exists(textureKey)) {
        console.error(`Loot texture ${textureKey} does not exist! Skipping loot ${index}`);
        return;
      }
      
      try {
        const loot = this.scene.physics.add.sprite(lootData.x, lootData.y, textureKey);
        loot.setData('type', lootData.type);
        
        // Set proper depth for loot
        loot.setDepth(3);
        loot.setVisible(true);
        
        // Add sparkle effect
        this.scene.tweens.add({
          targets: loot,
          alpha: 0.7,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        lootGroup.add(loot);
        console.log(`Created loot ${lootData.type} at (${lootData.x}, ${lootData.y})`);
        
      } catch (error) {
        console.error(`Failed to create loot ${lootData.type}:`, error);
      }
    });
    
    console.log(`Successfully spawned ${lootGroup.children.size} loot items`);
  }

  private getEnemyStats(type: string): { health: number; damage: number; experience: number } {
    switch (type) {
      case 'goblin':
        return { health: 30, damage: 15, experience: 25 };
      case 'orc':
        return { health: 50, damage: 25, experience: 40 };
      case 'skeleton':
        return { health: 40, damage: 20, experience: 35 };
      case 'boss':
        return { health: 100, damage: 35, experience: 100 };
      default:
        return { health: 30, damage: 15, experience: 25 };
    }
  }

  private addEnemyAI(enemy: Phaser.Physics.Arcade.Sprite, type: string): void {
    const baseX = enemy.x;
    const baseY = enemy.y;
    
    // Different AI patterns based on enemy type
    switch (type) {
      case 'goblin':
        // Quick, erratic movement
        this.scene.tweens.add({
          targets: enemy,
          x: baseX + Phaser.Math.Between(-60, 60),
          y: baseY + Phaser.Math.Between(-60, 60),
          duration: Phaser.Math.Between(2000, 4000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
        
      case 'orc':
        // Slower, more predictable movement
        this.scene.tweens.add({
          targets: enemy,
          x: baseX + Phaser.Math.Between(-80, 80),
          y: baseY + Phaser.Math.Between(-80, 80),
          duration: Phaser.Math.Between(5000, 8000),
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
        break;
        
      case 'skeleton':
        // Medium speed, angular movement
        this.scene.tweens.add({
          targets: enemy,
          x: baseX + Phaser.Math.Between(-70, 70),
          y: baseY + Phaser.Math.Between(-70, 70),
          duration: Phaser.Math.Between(3000, 6000),
          yoyo: true,
          repeat: -1,
          ease: 'Back.easeInOut'
        });
        break;
        
      case 'boss':
        // Minimal movement, stays in area
        this.scene.tweens.add({
          targets: enemy,
          x: baseX + Phaser.Math.Between(-40, 40),
          y: baseY + Phaser.Math.Between(-40, 40),
          duration: Phaser.Math.Between(6000, 10000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
    }
  }
}
