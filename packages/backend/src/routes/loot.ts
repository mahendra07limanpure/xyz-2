import { Router } from 'express';
import { LootController } from '../controllers/lootController';

const router = Router();
const lootController = new LootController();

// Loot generation routes
router.post('/generate', lootController.generateLoot);
router.get('/player/:playerId', lootController.getPlayerLoot);
router.get('/equipment/:tokenId', lootController.getEquipment);

// Lending marketplace routes
router.post('/lend', lootController.createLendingOrder);
router.post('/borrow', lootController.borrowEquipment);
router.get('/marketplace', lootController.getMarketplace);
router.put('/lending/:orderId', lootController.updateLendingOrder);

export { router as lootRouter };
