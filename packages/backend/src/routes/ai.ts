import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();
const aiController = new AIController();

// AI NPC interaction routes
router.post('/interact', aiController.interactWithNPC);
router.get('/npcs', aiController.getAvailableNPCs);
router.get('/history/:playerId', aiController.getInteractionHistory);
router.post('/quest/:npcId', aiController.getQuest);

export { router as aiRouter };
