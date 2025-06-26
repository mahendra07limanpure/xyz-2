import { Router } from 'express';
import { PartyController } from '../controllers/partyController';

const router = Router();
const partyController = new PartyController();

// Party management routes
router.post('/create', partyController.createParty);
router.post('/join', partyController.joinParty);
router.post('/leave', partyController.leaveParty);
router.get('/:partyId', partyController.getParty);
router.get('/player/:address', partyController.getPlayerParty);
router.put('/:partyId', partyController.updateParty);
router.delete('/:partyId', partyController.disbandParty);

export { router as partyRouter };
