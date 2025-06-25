import { Router } from 'express';
import { GameController } from '../controllers/gameController';

const router = Router();
const gameController = new GameController();

// Game state routes
router.get('/state/:playerId', gameController.getGameState);
router.post('/leave', gameController.leaveGame);
router.get('/leaderboard', gameController.getLeaderboard);

// Player routes
router.post('/player/connect', gameController.connectPlayer);
router.get('/player/:wallet', gameController.getPlayer);
router.put('/player/:playerId', gameController.updatePlayer);

export { router as gameRouter };
