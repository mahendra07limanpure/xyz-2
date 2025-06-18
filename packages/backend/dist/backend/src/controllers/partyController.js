"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyController = void 0;
const prisma_1 = require("../database/prisma");
const blockchainService_1 = require("../services/blockchainService");
const logger_1 = require("../utils/logger");
class PartyController {
    getDb() {
        return (0, prisma_1.getDatabase)();
    }
    async createParty(req, res, next) {
        try {
            const { playerId, playerAddress, name, maxSize = 4, chainId = 11155111 } = req.body;
            if (!playerId || !playerAddress) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: playerId, playerAddress'
                });
                return;
            }
            try {
                await blockchainService_1.blockchainService.registerPlayer(chainId, playerAddress);
            }
            catch (error) {
                logger_1.logger.warn('Player may already be registered on blockchain:', error);
            }
            const blockchainResult = await blockchainService_1.blockchainService.createParty(chainId, maxSize);
            const party = await this.getDb().party.create({
                data: {
                    name,
                    maxSize,
                    chainId,
                    members: {
                        create: {
                            playerId,
                            role: 'leader',
                            isLeader: true
                        }
                    }
                },
                include: {
                    members: {
                        include: {
                            player: {
                                select: { id: true, username: true, wallet: true }
                            }
                        }
                    }
                }
            });
            res.json({
                success: true,
                data: {
                    ...party,
                    blockchainPartyId: blockchainResult.partyId.toString(),
                    transactionHash: blockchainResult.transactionHash
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Create party error:', error);
            next(error);
        }
    }
    async joinParty(req, res, next) {
        try {
            const { partyId, playerId, role = 'member' } = req.body;
            if (!partyId || !playerId || typeof partyId !== 'string' || typeof playerId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: partyId, playerId'
                });
                return;
            }
            const party = await this.getDb().party.findUnique({
                where: { id: partyId },
                include: {
                    members: true
                }
            });
            if (!party || !party.isActive) {
                res.status(404).json({
                    success: false,
                    message: 'Party not found or inactive'
                });
                return;
            }
            if (party.members.length >= party.maxSize) {
                res.status(400).json({
                    success: false,
                    message: 'Party is full'
                });
                return;
            }
            const existingMember = party.members.find((m) => m.playerId === playerId);
            if (existingMember) {
                res.status(400).json({
                    success: false,
                    message: 'Player is already in this party'
                });
                return;
            }
            const member = await this.getDb().partyMember.create({
                data: {
                    partyId,
                    playerId,
                    role,
                    isLeader: false
                },
                include: {
                    player: true,
                    party: {
                        include: {
                            members: {
                                include: {
                                    player: true
                                }
                            }
                        }
                    }
                }
            });
            res.json({
                success: true,
                data: member.party
            });
        }
        catch (error) {
            logger_1.logger.error('Join party error:', error);
            next(error);
        }
    }
    async leaveParty(req, res, next) {
        try {
            const { partyId, playerId } = req.body;
            if (!partyId || !playerId || typeof partyId !== 'string' || typeof playerId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: partyId, playerId'
                });
                return;
            }
            const member = await this.getDb().partyMember.findFirst({
                where: {
                    partyId,
                    playerId
                },
                include: {
                    party: {
                        include: {
                            members: true
                        }
                    }
                }
            });
            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Player not found in party'
                });
                return;
            }
            await this.getDb().partyMember.delete({
                where: { id: member.id }
            });
            if (member.party.members.length === 1) {
                await this.getDb().party.update({
                    where: { id: partyId },
                    data: { isActive: false }
                });
            }
            else if (member.isLeader) {
                const remainingMembers = member.party.members.filter((m) => m.id !== member.id);
                if (remainingMembers.length > 0) {
                    await this.getDb().partyMember.update({
                        where: { id: remainingMembers[0].id },
                        data: { isLeader: true, role: 'leader' }
                    });
                }
            }
            res.json({
                success: true,
                message: 'Left party successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Leave party error:', error);
            next(error);
        }
    }
    async getParty(req, res, next) {
        try {
            const { partyId } = req.params;
            const party = await this.getDb().party.findUnique({
                where: { id: partyId },
                include: {
                    members: {
                        include: {
                            player: true
                        }
                    },
                    dungeonRuns: {
                        orderBy: { startedAt: 'desc' },
                        take: 10
                    }
                }
            });
            if (!party) {
                res.status(404).json({
                    success: false,
                    message: 'Party not found'
                });
                return;
            }
            res.json({
                success: true,
                data: party
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPlayerParty(req, res, next) {
        try {
            const { playerId } = req.params;
            const membership = await this.getDb().partyMember.findFirst({
                where: {
                    playerId,
                    party: { isActive: true }
                },
                include: {
                    party: {
                        include: {
                            members: {
                                include: {
                                    player: true
                                }
                            }
                        }
                    }
                }
            });
            if (!membership) {
                res.json({
                    success: true,
                    data: null
                });
                return;
            }
            res.json({
                success: true,
                data: membership.party
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateParty(req, res, next) {
        try {
            const { partyId } = req.params;
            const updateData = req.body;
            const party = await this.getDb().party.update({
                where: { id: partyId },
                data: updateData,
                include: {
                    members: {
                        include: {
                            player: true
                        }
                    }
                }
            });
            res.json({
                success: true,
                data: party
            });
        }
        catch (error) {
            next(error);
        }
    }
    async disbandParty(req, res, next) {
        try {
            const { partyId } = req.params;
            const { playerId } = req.body;
            const leader = await this.getDb().partyMember.findFirst({
                where: {
                    partyId,
                    playerId,
                    isLeader: true
                }
            });
            if (!leader) {
                res.status(403).json({
                    success: false,
                    message: 'Only the party leader can disband the party'
                });
                return;
            }
            await this.getDb().party.update({
                where: { id: partyId },
                data: { isActive: false }
            });
            res.json({
                success: true,
                message: 'Party disbanded successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PartyController = PartyController;
//# sourceMappingURL=partyController.js.map