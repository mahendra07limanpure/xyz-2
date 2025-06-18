"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partyRouter = void 0;
const express_1 = require("express");
const partyController_1 = require("../controllers/partyController");
const router = (0, express_1.Router)();
exports.partyRouter = router;
const partyController = new partyController_1.PartyController();
router.post('/create', partyController.createParty);
router.post('/join', partyController.joinParty);
router.post('/leave', partyController.leaveParty);
router.get('/:partyId', partyController.getParty);
router.get('/player/:playerId', partyController.getPlayerParty);
router.put('/:partyId', partyController.updateParty);
router.delete('/:partyId', partyController.disbandParty);
//# sourceMappingURL=party.js.map