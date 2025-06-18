import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/prisma';
import { logger } from '../utils/logger';

export class LootController {
  private getDb() {
    return getDatabase();
  }

  async generateLoot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId, dungeonLevel = 1, lootType = 'random' } = req.body;

      if (!playerId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required field: playerId' 
        });
        return;
      }

      // Generate random equipment
      const equipment = this.generateRandomEquipment(dungeonLevel);
      
      // Save to database
      const createdEquipment = await this.getDb().equipment.create({
        data: {
          ...equipment,
          ownerId: playerId
        }
      });

      res.json({ 
        success: true, 
        data: createdEquipment 
      });

    } catch (error) {
      logger.error('Generate loot error:', error);
      next(error);
    }
  }

  async getPlayerLoot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const equipment = await this.getDb().equipment.findMany({
        where: { ownerId: playerId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      });

      res.json({ 
        success: true, 
        data: equipment 
      });

    } catch (error) {
      next(error);
    }
  }

  async getEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tokenId } = req.params;

      const equipment = await this.getDb().equipment.findUnique({
        where: { tokenId },
        include: {
          owner: true,
          lendingOrders: {
            where: { status: 'active' }
          }
        }
      });

      if (!equipment) {
        res.status(404).json({ 
          success: false, 
          message: 'Equipment not found' 
        });
        return;
      }

      res.json({ 
        success: true, 
        data: equipment 
      });

    } catch (error) {
      next(error);
    }
  }

  async createLendingOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { equipmentId, lenderId, price, collateral, duration } = req.body;

      if (!equipmentId || !lenderId || !price || !collateral || !duration) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
        return;
      }

      // Check if equipment exists and is owned by lender
      const equipment = await this.getDb().equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment || equipment.ownerId !== lenderId) {
        res.status(400).json({ 
          success: false, 
          message: 'Equipment not found or not owned by lender' 
        });
        return;
      }

      // Create lending order
      const lendingOrder = await this.getDb().lendingOrder.create({
        data: {
          equipmentId,
          lenderId,
          price,
          collateral,
          duration,
          status: 'active',
          expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000) // duration in hours
        },
        include: {
          equipment: true
        }
      });

      res.json({ 
        success: true, 
        data: lendingOrder 
      });

    } catch (error) {
      logger.error('Create lending order error:', error);
      next(error);
    }
  }

  async borrowEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, borrowerId } = req.body;

      if (!orderId || !borrowerId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: orderId, borrowerId' 
        });
        return;
      }

      const order = await this.getDb().lendingOrder.findUnique({
        where: { id: orderId },
        include: { equipment: true }
      });

      if (!order || order.status !== 'active') {
        res.status(400).json({ 
          success: false, 
          message: 'Lending order not found or not active' 
        });
        return;
      }

      if (order.expiresAt < new Date()) {
        res.status(400).json({ 
          success: false, 
          message: 'Lending order has expired' 
        });
        return;
      }

      // Update lending order
      const updatedOrder = await this.getDb().lendingOrder.update({
        where: { id: orderId },
        data: {
          borrowerId,
          status: 'completed'
        },
        include: {
          equipment: true
        }
      });

      res.json({ 
        success: true, 
        data: updatedOrder 
      });

    } catch (error) {
      logger.error('Borrow equipment error:', error);
      next(error);
    }
  }

  async getMarketplace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        equipmentType, 
        rarity, 
        minPrice, 
        maxPrice 
      } = req.query;

      const where: any = {
        status: 'active',
        expiresAt: { gt: new Date() }
      };

      if (equipmentType) {
        where.equipment = { equipmentType };
      }

      if (rarity) {
        where.equipment = { ...where.equipment, rarity };
      }

      if (minPrice) {
        where.price = { ...where.price, gte: String(minPrice) };
      }

      if (maxPrice) {
        where.price = { ...where.price, lte: String(maxPrice) };
      }

      const orders = await this.getDb().lendingOrder.findMany({
        where,
        include: {
          equipment: true
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      });

      res.json({ 
        success: true, 
        data: orders 
      });

    } catch (error) {
      next(error);
    }
  }

  async updateLendingOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const updateData = req.body;

      const order = await this.getDb().lendingOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          equipment: true
        }
      });

      res.json({ 
        success: true, 
        data: order 
      });

    } catch (error) {
      next(error);
    }
  }

  private generateRandomEquipment(dungeonLevel: number) {
    const types = ['weapon', 'armor', 'accessory', 'consumable'];
    const rarities = ['common', 'rare', 'epic', 'legendary'];
    const rarityWeights = [60, 25, 12, 3]; // Percentage chances

    const equipmentType = types[Math.floor(Math.random() * types.length)]!;
    
    // Determine rarity based on weights
    const rand = Math.random() * 100;
    let cumulativeWeight = 0;
    let rarity = 'common';
    
    for (let i = 0; i < rarities.length; i++) {
      cumulativeWeight += rarityWeights[i]!;
      if (rand <= cumulativeWeight) {
        rarity = rarities[i]!;
        break;
      }
    }

    // Generate stats based on dungeon level and rarity
    const rarityMultiplier = { common: 1, rare: 1.5, epic: 2, legendary: 3 }[rarity] || 1;
    const baseStats = Math.floor(dungeonLevel * 10 * rarityMultiplier);

    const equipment = {
      tokenId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateEquipmentName(equipmentType, rarity),
      equipmentType,
      rarity,
      attackPower: equipmentType === 'weapon' ? baseStats + Math.floor(Math.random() * 20) : 0,
      defensePower: equipmentType === 'armor' ? baseStats + Math.floor(Math.random() * 20) : 0,
      magicPower: Math.floor(Math.random() * baseStats * 0.5),
      specialAbility: rarity !== 'common' ? this.generateSpecialAbility(equipmentType) : null,
      isLendable: false
    };

    return equipment;
  }

  private generateEquipmentName(type: string, rarity: string): string {
    const prefixes = {
      common: ['Basic', 'Simple', 'Plain'],
      rare: ['Enhanced', 'Superior', 'Fine'],
      epic: ['Masterwork', 'Enchanted', 'Legendary'],
      legendary: ['Mythical', 'Ancient', 'Divine']
    };

    const weaponNames = ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger'];
    const armorNames = ['Helmet', 'Chestplate', 'Gauntlets', 'Boots', 'Shield'];
    const accessoryNames = ['Ring', 'Amulet', 'Cloak', 'Belt', 'Bracelet'];
    const consumableNames = ['Potion', 'Scroll', 'Elixir', 'Tonic', 'Herb'];

    let baseNames: string[];
    switch (type) {
      case 'weapon': baseNames = weaponNames; break;
      case 'armor': baseNames = armorNames; break;
      case 'accessory': baseNames = accessoryNames; break;
      case 'consumable': baseNames = consumableNames; break;
      default: baseNames = ['Item'];
    }

    const prefix = prefixes[rarity as keyof typeof prefixes][Math.floor(Math.random() * 3)];
    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];

    return `${prefix} ${baseName}`;
  }

  private generateSpecialAbility(type: string): string {
    const abilities = {
      weapon: ['Flame Strike', 'Frost Bite', 'Lightning Bolt', 'Poison Edge', 'Vampiric Drain'],
      armor: ['Damage Reflection', 'Magic Shield', 'Regeneration', 'Spell Absorption', 'Fortification'],
      accessory: ['Luck Boost', 'Experience Gain', 'Mana Regeneration', 'Health Boost', 'Speed Enhancement'],
      consumable: ['Instant Heal', 'Mana Restore', 'Temporary Strength', 'Invisibility', 'Berserker Rage']
    };

    const typeAbilities = abilities[type as keyof typeof abilities] || abilities.weapon;
    return typeAbilities[Math.floor(Math.random() * typeAbilities.length)]!;
  }
}
