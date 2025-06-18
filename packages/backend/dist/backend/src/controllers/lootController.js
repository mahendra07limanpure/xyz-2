"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lootController = exports.LootController = void 0;
const prisma_1 = require("../database/prisma");
const blockchainService_1 = require("../services/blockchainService");
const logger_1 = require("../utils/logger");
class LootController {
    getDb() {
        return (0, prisma_1.getDatabase)();
    }
    async generateLoot(req, res, next) {
        try {
            const { playerId, playerAddress, dungeonLevel = 1, chainId = 11155111 } = req.body;
            if (!playerId || !playerAddress) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: playerId, playerAddress'
                });
                return;
            }
            const equipment = this.generateRandomEquipment(dungeonLevel);
            const mintResult = await blockchainService_1.blockchainService.mintLoot(chainId, playerAddress, equipment.name, equipment.equipmentType, this.getRarityIndex(equipment.rarity), equipment.attackPower, equipment.attributes || []);
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
        }
        catch (error) {
            logger_1.logger.error('Generate loot error:', error);
            next(error);
        }
    }
    async getPlayerLoot(req, res, next) {
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
        }
        catch (error) {
            logger_1.logger.error('Get player loot error:', error);
            next(error);
        }
    }
    async getEquipment(req, res, next) {
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
        }
        catch (error) {
            logger_1.logger.error('Get equipment error:', error);
            next(error);
        }
    }
    async createLendingOrder(req, res, next) {
        try {
            const { equipmentId, lenderId, price, collateral, duration = 24 } = req.body;
            if (!equipmentId || !lenderId || !price || !collateral) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: equipmentId, lenderId, price, collateral'
                });
                return;
            }
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
        }
        catch (error) {
            logger_1.logger.error('Create lending order error:', error);
            next(error);
        }
    }
    async borrowEquipment(req, res, next) {
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
        }
        catch (error) {
            logger_1.logger.error('Borrow equipment error:', error);
            next(error);
        }
    }
    async getMarketplace(req, res, next) {
        try {
            const { limit = 20, offset = 0, rarity, equipmentType, minPrice, maxPrice } = req.query;
            const where = {
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
        }
        catch (error) {
            logger_1.logger.error('Get marketplace error:', error);
            next(error);
        }
    }
    async updateLendingOrder(req, res, next) {
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
        }
        catch (error) {
            logger_1.logger.error('Update lending order error:', error);
            next(error);
        }
    }
    generateRandomEquipment(dungeonLevel) {
        const equipmentTypes = ['weapon', 'armor', 'accessory', 'consumable'];
        const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        const rarity = this.generateRarity(dungeonLevel);
        const rarityIndex = this.getRarityIndex(rarity);
        const basePower = (rarityIndex + 1) * 10 + dungeonLevel * 5;
        const attackPower = basePower + Math.floor(Math.random() * 20);
        return {
            name: this.generateEquipmentName(equipmentType || 'weapon', rarity),
            equipmentType: equipmentType,
            rarity,
            attackPower,
            defensePower: Math.floor(attackPower * 0.8),
            magicPower: Math.floor(attackPower * 0.6),
            specialAbility: this.generateSpecialAbility(rarity),
            attributes: [`${equipmentType} +${attackPower}`],
        };
    }
    generateRarity(dungeonLevel) {
        const roll = Math.random() * 100 + dungeonLevel * 2;
        if (roll >= 95)
            return 'mythic';
        if (roll >= 85)
            return 'legendary';
        if (roll >= 70)
            return 'epic';
        if (roll >= 50)
            return 'rare';
        if (roll >= 25)
            return 'uncommon';
        return 'common';
    }
    generateEquipmentName(type, rarity) {
        const prefixes = {
            common: 'Basic', uncommon: 'Enhanced', rare: 'Superior',
            epic: 'Heroic', legendary: 'Legendary', mythic: 'Mythic'
        };
        const names = {
            weapon: 'Sword', armor: 'Armor', accessory: 'Ring', consumable: 'Potion'
        };
        return `${prefixes[rarity]} ${names[type]}`;
    }
    generateSpecialAbility(rarity) {
        const rarityIndex = this.getRarityIndex(rarity);
        if (rarityIndex < 2)
            return null;
        const abilities = ['Fire Damage', 'Ice Damage', 'Lightning Damage'];
        const ability = abilities[Math.floor(Math.random() * abilities.length)];
        return ability || null;
    }
    getRarityIndex(rarity) {
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        return rarities.indexOf(rarity.toLowerCase());
    }
}
exports.LootController = LootController;
exports.lootController = new LootController();
//# sourceMappingURL=lootController.js.map