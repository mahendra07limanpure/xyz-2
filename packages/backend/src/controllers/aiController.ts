import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/prisma';
import { elizaService } from '../services/elizaService';
import { logger } from '../utils/logger';

export class AIController {
  private getDb() {
    return getDatabase();
  }

  async interactWithNPC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId, npcId, message, context } = req.body;

      if (!playerId || !npcId || !message) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: playerId, npcId, message' 
        });
        return;
      }

      // Get NPC agent
      const agent = elizaService.getAgent(npcId);
      if (!agent) {
        res.status(404).json({ 
          success: false, 
          message: 'NPC not found' 
        });
        return;
      }

      // Generate AI response
      const response = await elizaService.generateResponse(npcId, message, context);

      // Save interaction to database
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

    } catch (error) {
      logger.error('AI interaction error:', error);
      next(error);
    }
  }

  async getAvailableNPCs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agents = elizaService.getAvailableAgents();
      
      res.json({ 
        success: true, 
        data: agents 
      });
    } catch (error) {
      next(error);
    }
  }

  async getInteractionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  async getQuest(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const agent = elizaService.getAgent(npcId);
      if (!agent) {
        res.status(404).json({ 
          success: false, 
          message: 'NPC not found' 
        });
        return;
      }

      // Generate quest based on NPC and player context
      const questContext = {
        npcSpecialties: agent.specialties,
        requestType: 'quest'
      };

      const questDescription = await elizaService.generateResponse(
        npcId, 
        'Give me a quest', 
        questContext
      );

      // For now, return a simple quest structure
      // In a full implementation, this would create actual quest entities
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

    } catch (error) {
      next(error);
    }
  }
}
