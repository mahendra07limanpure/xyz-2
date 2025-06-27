import { Router } from 'express';
import { LootController } from '../controllers/lootController';

const router = Router();
const lootController = new LootController();

// Loot generation routes
router.post('/generate', lootController.generateLoot.bind(lootController));
router.post('/generate-dev', lootController.generateLootDev.bind(lootController));
router.get('/player/:playerId', lootController.getPlayerLoot.bind(lootController));
router.get('/equipment/:tokenId', lootController.getEquipment.bind(lootController));
router.post('/sync', lootController.syncEquipment.bind(lootController));

// Lending marketplace routes
router.post('/lend', lootController.createLendingOrder.bind(lootController));
router.post('/borrow', lootController.borrowEquipment.bind(lootController));
router.get('/marketplace', lootController.getMarketplace.bind(lootController));
router.put('/lending/:orderId', lootController.updateLendingOrder.bind(lootController));
router.delete('/lending/:orderId', lootController.cancelLendingOrder.bind(lootController));

export { router as lootRouter };
