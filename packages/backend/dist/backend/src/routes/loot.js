"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lootRouter = void 0;
const express_1 = require("express");
const lootController_1 = require("../controllers/lootController");
const router = (0, express_1.Router)();
exports.lootRouter = router;
const lootController = new lootController_1.LootController();
router.post('/generate', lootController.generateLoot);
router.get('/player/:playerId', lootController.getPlayerLoot);
router.get('/equipment/:tokenId', lootController.getEquipment);
router.post('/lend', lootController.createLendingOrder);
router.post('/borrow', lootController.borrowEquipment);
router.get('/marketplace', lootController.getMarketplace);
router.put('/lending/:orderId', lootController.updateLendingOrder);
//# sourceMappingURL=loot.js.map