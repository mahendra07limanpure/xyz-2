import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/prisma';
import { blockchainService } from '../services/blockchainService';
import { logger } from '../utils/logger';

export class LootController {
  private getDb() {
    return getDatabase();
  }

  async generateLoot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        playerId, 
        playerAddress, 
        dungeonLevel = 1, 
        chainId = 11155111 
      } = req.body;

      if (!playerId || !playerAddress) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: playerId, playerAddress' 
        });
        return;
      }

      // Generate random equipment
      const equipment = this.generateRandomEquipment(dungeonLevel);
      
      // Mint NFT on blockchain
      const mintResult = await blockchainService.mintLoot(
        chainId,
        playerAddress,
        equipment.name,
        equipment.equipmentType,
        this.getRarityIndex(equipment.rarity),
        equipment.attackPower,
        equipment.attributes || []
      );

      // Save to database
      const createdEquipment = await this.getDb().equipment.create({
        data: {
          ...equipment,
          tokenId: mintResult.tokenId.toString(),
          ownerId: playerId,
        }
      });

      res.json({ 
        success: true, 
        data: {
          ...createdEquipment,
          transactionHash: mintResult.transactionHash,
          chainId
        }
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

      if (!playerId) {
        res.status(400).json({ success: false, message: 'Player ID is required' });
        return;
      }

      const equipment = await this.getDb().equipment.findMany({
        where: { ownerId: playerId },
        skip: Number(offset),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      });

      res.json({ 
        success: true, 
        data: equipment 
      });
    } catch (error) {
      logger.error('Get player loot error:', error);
      next(error);
    }
  }

  async getEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tokenId } = req.params;

      if (!tokenId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing tokenId' 
        });
        return;
      }

      const equipment = await this.getDb().equipment.findUnique({
        where: { tokenId: tokenId },
        include: {
          owner: {
            select: { id: true, username: true, wallet: true }
          },
          lendingOrders: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
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
      logger.error('Get equipment error:', error);
      next(error);
    }
  }

  async createLendingOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        equipmentId, 
        lenderId, 
        price, 
        collateral, 
        duration = 24 
      } = req.body;

      if (!equipmentId || !lenderId || !price || !collateral) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: equipmentId, lenderId, price, collateral' 
        });
        return;
      }

      // Check if equipment exists and is owned by lender
      const equipment = await this.getDb().equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment || equipment.ownerId !== lenderId) {
        res.status(403).json({ 
          success: false, 
          message: 'Equipment not found or not owned by lender' 
        });
        return;
      }

      if (!equipment.isLendable) {
        res.status(400).json({ 
          success: false, 
          message: 'Equipment is not lendable' 
        });
        return;
      }

      const lendingOrder = await this.getDb().lendingOrder.create({
        data: {
          equipmentId,
          lenderId,
          price: price.toString(),
          collateral: collateral.toString(),
          duration,
          status: 'active',
          expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000)
        },
        include: {
          equipment: {
            include: {
              owner: {
                select: { id: true, username: true, wallet: true }
              }
            }
          }
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
      const { orderId, borrowerId, borrowerAddress } = req.body;

      if (!orderId || !borrowerId || !borrowerAddress) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: orderId, borrowerId, borrowerAddress' 
        });
        return;
      }

      const order = await this.getDb().lendingOrder.findUnique({
        where: { id: orderId },
        include: {
          equipment: true
        }
      });

      if (!order || order.status !== 'active') {
        res.status(404).json({ 
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
          equipment: {
            include: {
              owner: {
                select: { id: true, username: true, wallet: true }
              }
            }
          }
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
        rarity, 
        equipmentType, 
        minPrice, 
        maxPrice 
      } = req.query;

      const where: any = { 
        status: 'active',
        expiresAt: { gt: new Date() }
      };

      if (rarity) {
        where.equipment = { ...where.equipment, rarity };
      }
      if (equipmentType) {
        where.equipment = { ...where.equipment, equipmentType };
      }
      if (minPrice) {
        where.price = { ...where.price, gte: minPrice.toString() };
      }
      if (maxPrice) {
        where.price = { ...where.price, lte: maxPrice.toString() };
      }

      const [orders, total] = await Promise.all([
        this.getDb().lendingOrder.findMany({
          where,
          include: {
            equipment: {
              include: {
                owner: {
                  select: { id: true, username: true, wallet: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          skip: Number(offset)
        }),
        this.getDb().lendingOrder.count({ where })
      ]);

      res.json({ 
        success: true, 
        data: {
          orders,
          pagination: {
            total,
            offset: Number(offset),
            limit: Number(limit),
            hasMore: Number(offset) + Number(limit) < total
          }
        }
      });

    } catch (error) {
      logger.error('Get marketplace error:', error);
      next(error);
    }
  }

  async updateLendingOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status, borrowerId } = req.body;

      if (!orderId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing orderId' 
        });
        return;
      }

      const updatedOrder = await this.getDb().lendingOrder.update({
        where: { id: orderId },
        data: { status, borrowerId },
        include: {
          equipment: {
            include: {
              owner: {
                select: { id: true, username: true, wallet: true }
              }
            }
          }
        }
      });

      res.json({ 
        success: true, 
        data: updatedOrder 
      });

    } catch (error) {
      logger.error('Update lending order error:', error);
      next(error);
    }
  }

  private generateRandomEquipment(dungeonLevel: number) {
    const equipmentTypes = ['weapon', 'armor', 'accessory', 'consumable'];
    const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    const rarity = this.generateRarity(dungeonLevel);
    const rarityIndex = this.getRarityIndex(rarity);
    
    const basePower = (rarityIndex + 1) * 10 + dungeonLevel * 5;
    const attackPower = basePower + Math.floor(Math.random() * 20);
    
    return {
      name: this.generateEquipmentName(equipmentType || 'weapon', rarity),
      equipmentType: equipmentType as string,
      rarity,
      attackPower,
      defensePower: Math.floor(attackPower * 0.8),
      magicPower: Math.floor(attackPower * 0.6),
      specialAbility: this.generateSpecialAbility(rarity),
      attributes: [`${equipmentType} +${attackPower}`],
    };
  }

  private generateRarity(dungeonLevel: number): string {
    const roll = Math.random() * 100 + dungeonLevel * 2;
    if (roll >= 95) return 'mythic';
    if (roll >= 85) return 'legendary';
    if (roll >= 70) return 'epic';
    if (roll >= 50) return 'rare';
    if (roll >= 25) return 'uncommon';
    return 'common';
  }

  private generateEquipmentName(type: string, rarity: string): string {
    const prefixes = {
      common: 'Basic', uncommon: 'Enhanced', rare: 'Superior',
      epic: 'Heroic', legendary: 'Legendary', mythic: 'Mythic'
    };
    const names = {
      weapon: 'Sword', armor: 'Armor', accessory: 'Ring', consumable: 'Potion'
    };
    return `${prefixes[rarity as keyof typeof prefixes]} ${names[type as keyof typeof names]}`;
  }

  private generateSpecialAbility(rarity: string): string | null {
    const rarityIndex = this.getRarityIndex(rarity);
    if (rarityIndex < 2) return null;
    const abilities = ['Fire Damage', 'Ice Damage', 'Lightning Damage'];
    const ability = abilities[Math.floor(Math.random() * abilities.length)];
    return ability || null;
  }

  private getRarityIndex(rarity: string): number {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    return rarities.indexOf(rarity.toLowerCase());
  }
}

export const lootController = new LootController();