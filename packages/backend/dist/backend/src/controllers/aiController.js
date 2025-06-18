"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const prisma_1 = require("../database/prisma");
const elizaService_1 = require("../services/elizaService");
const logger_1 = require("../utils/logger");
class AIController {
    getDb() {
        return (0, prisma_1.getDatabase)();
    }
    async interactWithNPC(req, res, next) {
        try {
            const { playerId, npcId, message, context } = req.body;
            if (!playerId || !npcId || !message) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: playerId, npcId, message'
                });
                return;
            }
            const agent = elizaService_1.elizaService.getAgent(npcId);
            if (!agent) {
                res.status(404).json({
                    success: false,
                    message: 'NPC not found'
                });
                return;
            }
            const response = await elizaService_1.elizaService.generateResponse(npcId, message, context);
            const interaction = await this.getDb().aIInteraction.create({
                data: {
                    playerId,
                    npcName: agent.name,
                    interaction: 'dialogue',
                    context: JSON.stringify(context || {}),
                    response
                }
            });
            res.json({
                success: true,
                data: {
                    npc: agent,
                    response,
                    interactionId: interaction.id
                }
            });
        }
        catch (error) {
            logger_1.logger.error('AI interaction error:', error);
            next(error);
        }
    }
    async getAvailableNPCs(req, res, next) {
        try {
            const agents = elizaService_1.elizaService.getAvailableAgents();
            res.json({
                success: true,
                data: agents
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getInteractionHistory(req, res, next) {
        try {
            const { playerId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            if (!playerId || typeof playerId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid playerId'
                });
                return;
            }
            const interactions = await this.getDb().aIInteraction.findMany({
                where: { playerId: playerId },
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset)
            });
            res.json({
                success: true,
                data: interactions
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getQuest(req, res, next) {
        try {
            const { npcId } = req.params;
            const { playerId } = req.body;
            if (!npcId) {
                res.status(400).json({
                    success: false,
                    message: 'NPC ID is required'
                });
                return;
            }
            const agent = elizaService_1.elizaService.getAgent(npcId);
            if (!agent) {
                res.status(404).json({
                    success: false,
                    message: 'NPC not found'
                });
                return;
            }
            const questContext = {
                npcSpecialties: agent.specialties,
                requestType: 'quest'
            };
            const questDescription = await elizaService_1.elizaService.generateResponse(npcId, 'Give me a quest', questContext);
            const quest = {
                id: `quest_${Date.now()}`,
                npcId,
                npcName: agent.name,
                title: `Quest from ${agent.name}`,
                description: questDescription,
                type: 'dynamic',
                rewards: {
                    experience: Math.floor(Math.random() * 500) + 100,
                    gold: Math.floor(Math.random() * 1000) + 200
                },
                requirements: {
                    level: Math.max(1, Math.floor(Math.random() * 10))
                }
            };
            res.json({
                success: true,
                data: quest
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AIController = AIController;
//# sourceMappingURL=aiController.js.map