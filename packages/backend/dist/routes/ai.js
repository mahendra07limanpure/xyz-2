"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
exports.aiRouter = router;
const aiController = new aiController_1.AIController();
router.post('/interact', aiController.interactWithNPC);
router.get('/npcs', aiController.getAvailableNPCs);
router.get('/history/:playerId', aiController.getInteractionHistory);
router.post('/quest/:npcId', aiController.getQuest);
//# sourceMappingURL=ai.js.map