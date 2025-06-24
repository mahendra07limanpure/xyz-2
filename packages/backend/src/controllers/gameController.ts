import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/prisma';
import { logger } from '../utils/logger';
import { GameState } from '../../../shared/src/types';
import { Player as SharedPlayer } from '../../../shared/src/types';

export class GameController {
  private getDb() {
    return getDatabase();
  }

  async getGameState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId } = req.params;
      
      const player = await this.getDb().player.findUnique({
        where: { id: playerId },
        include: {
          parties: {
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
          },
          equipment: true,
          gameStats: true
        }
      });

      if (!player) {
        res.status(404).json({ success: false, message: 'Player not found' });
        return;
      }

      const gameState: GameState = {
        player: {
          id: player.id,
          walletAddress: player.wallet,
          username: player.username,
          level: player.level,
          experience: player.experience,
          chainId: 1, // Default to Ethereum mainnet
          createdAt: player.createdAt,
          updatedAt: player.updatedAt
        },
        party: player.parties[0]?.party || null,
        equipment: player.equipment,
        stats: player.gameStats || {
          dungeonsCleared: 0,
          totalLoot: 0,
          totalExperience: 0,
          highestLevel: 1,
          gamesPlayed: 0
        }
      };

      res.json({ success: true, data: gameState });
    } catch (error) {
      next(error);
    }
  }

  async joinGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { wallet } = req.body;

      let player = await this.getDb().player.findUnique({
        where: { wallet }
      });

      if (!player) {
        player = await this.getDb().player.create({
          data: {
            wallet,
            gameStats: {
              create: {}
            }
          },
          include: {
            gameStats: true
          }
        });
      } else {
        player = await this.getDb().player.update({
          where: { id: player.id },
          data: { isActive: true },
          include: {
            gameStats: true
          }
        });
      }

      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  }

  async leaveGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId } = req.body;

      await this.getDb().player.update({
        where: { id: playerId },
        data: { isActive: false }
      });

      res.json({ success: true, message: 'Player left the game' });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const players = await this.getDb().player.findMany({
        include: {
          gameStats: true
        },
        orderBy: {
          level: 'desc'
        },
        take: 50
      });

      res.json({ success: true, data: players });
    } catch (error) {
      next(error);
    }
  }

  async registerPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { wallet, username } = req.body;

      const existingPlayer = await this.getDb().player.findUnique({
        where: { wallet }
      });

      if (existingPlayer) {
        res.status(400).json({ success: false, message: 'Player already registered' });
        return;
      }

      const player = await this.getDb().player.create({
        data: {
          wallet,
          username,
          gameStats: {
            create: {}
          }
        },
        include: {
          gameStats: true
        }
      });

      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  }

  async getPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { wallet } = req.params;

      const player = await this.getDb().player.findUnique({
        where: { wallet },
        include: {
          equipment: true,
          gameStats: true,
          parties: {
            include: {
              party: true
            }
          }
        }
      });

      if (!player) {
        res.status(404).json({ success: false, message: 'Player not found' });
        return;
      }

      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  }

  async updatePlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId } = req.params;
      const updateData = req.body;

      const player = await this.getDb().player.update({
        where: { id: playerId },
        data: updateData,
        include: {
          gameStats: true
        }
      });

      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  }
}
