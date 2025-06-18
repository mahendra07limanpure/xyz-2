"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyController = void 0;
const prisma_1 = require("../database/prisma");
const logger_1 = require("../utils/logger");
class PartyController {
    constructor() {
        this.db = (0, prisma_1.getDatabase)();
    }
    async createParty(req, res, next) {
        try {
            const { playerId, name, maxSize = 4, chainId } = req.body;
            if (!playerId || !chainId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: playerId, chainId'
                });
                return;
            }
            const existingMembership = await this.db.partyMember.findFirst({
                where: {
                    playerId,
                    party: { isActive: true }
                }
            });
            if (existingMembership) {
                res.status(400).json({
                    success: false,
                    message: 'Player is already in an active party'
                });
                return;
            }
            const party = await this.db.party.create({
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
            logger_1.logger.error('Create party error:', error);
            next(error);
        }
    }
    async joinParty(req, res, next) {
        try {
            const { partyId, playerId, role = 'member' } = req.body;
            if (!partyId || !playerId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: partyId, playerId'
                });
                return;
            }
            const party = await this.db.party.findUnique({
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
            const existingMember = party.members.find(m => m.playerId === playerId);
            if (existingMember) {
                res.status(400).json({
                    success: false,
                    message: 'Player is already in this party'
                });
                return;
            }
            const member = await this.db.partyMember.create({
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
            if (!partyId || !playerId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: partyId, playerId'
                });
                return;
            }
            const member = await this.db.partyMember.findFirst({
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
            await this.db.partyMember.delete({
                where: { id: member.id }
            });
            if (member.party.members.length === 1) {
                await this.db.party.update({
                    where: { id: partyId },
                    data: { isActive: false }
                });
            }
            else if (member.isLeader) {
                const remainingMembers = member.party.members.filter(m => m.id !== member.id);
                if (remainingMembers.length > 0) {
                    await this.db.partyMember.update({
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
            const party = await this.db.party.findUnique({
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
            const membership = await this.db.partyMember.findFirst({
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
            const party = await this.db.party.update({
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
            const leader = await this.db.partyMember.findFirst({
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
            await this.db.party.update({
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