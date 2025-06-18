import { Router } from 'express';
import { GameController } from '../controllers/gameController';

const router = Router();
const gameController = new GameController();

// Game state routes
router.get('/state/:playerId', gameController.getGameState);
router.post('/join', gameController.joinGame);
router.post('/leave', gameController.leaveGame);
router.get('/leaderboard', gameController.getLeaderboard);

// Player routes
router.post('/player/register', gameController.registerPlayer);
router.get('/player/:wallet', gameController.getPlayer);
router.put('/player/:playerId', gameController.updatePlayer);

export { router as gameRouter };
