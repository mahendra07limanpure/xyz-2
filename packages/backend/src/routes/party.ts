import { Router } from 'express';
import { PartyController } from '../controllers/partyController';

const router = Router();
const partyController = new PartyController();

// Party management routes
router.post('/create', partyController.createParty.bind(partyController));
router.post('/join', partyController.joinParty.bind(partyController));
router.post('/leave', partyController.leaveParty.bind(partyController));
router.get('/:partyId', partyController.getParty.bind(partyController));
router.get('/player/:playerId', partyController.getPlayerParty.bind(partyController));
router.post('/:partyId/disband', partyController.disbandParty.bind(partyController));
router.put('/:partyId', partyController.updateParty.bind(partyController));

export { router as partyRouter };
