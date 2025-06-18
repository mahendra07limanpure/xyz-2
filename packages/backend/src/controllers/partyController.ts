import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/prisma';
import { logger } from '../utils/logger';

export class PartyController {
  private getDb() {
    return getDatabase();
  }

  async createParty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId, name, maxSize = 4, chainId } = req.body;

      if (!playerId || !chainId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: playerId, chainId' 
        });
        return;
      }

      // Check if player is already in a party
      const existingMembership = await this.getDb().partyMember.findFirst({
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

      // Create party
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
              player: true
            }
          }
        }
      });

      res.json({ 
        success: true, 
        data: party 
      });

    } catch (error) {
      logger.error('Create party error:', error);
      next(error);
    }
  }

  async joinParty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { partyId, playerId, role = 'member' } = req.body;

      if (!partyId || !playerId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: partyId, playerId' 
        });
        return;
      }

      // Check if party exists and has space
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

      // Check if player is already in this party
      const existingMember = party.members.find((m: any) => m.playerId === playerId);
      if (existingMember) {
        res.status(400).json({ 
          success: false, 
          message: 'Player is already in this party' 
        });
        return;
      }

      // Add player to party
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

    } catch (error) {
      logger.error('Join party error:', error);
      next(error);
    }
  }

  async leaveParty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { partyId, playerId } = req.body;

      if (!partyId || !playerId) {
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

      // Remove player from party
      await this.getDb().partyMember.delete({
        where: { id: member.id }
      });

      // If this was the last member, deactivate the party
      if (member.party.members.length === 1) {
        await this.getDb().party.update({
          where: { id: partyId },
          data: { isActive: false }
        });
      }
      // If the leader left, assign new leader
      else if (member.isLeader) {
        const remainingMembers = member.party.members.filter((m: any) => m.id !== member.id);
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

    } catch (error) {
      logger.error('Leave party error:', error);
      next(error);
    }
  }

  async getParty(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    } catch (error) {
      next(error);
    }
  }

  async getPlayerParty(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    } catch (error) {
      next(error);
    }
  }

  async updateParty(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    } catch (error) {
      next(error);
    }
  }

  async disbandParty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { partyId } = req.params;
      const { playerId } = req.body;

      // Check if player is the leader
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

      // Deactivate party
      await this.getDb().party.update({
        where: { id: partyId },
        data: { isActive: false }
      });

      res.json({ 
        success: true, 
        message: 'Party disbanded successfully' 
      });

    } catch (error) {
      next(error);
    }
  }
}
