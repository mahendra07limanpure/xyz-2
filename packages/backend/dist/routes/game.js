"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRouter = void 0;
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const router = (0, express_1.Router)();
exports.gameRouter = router;
const gameController = new gameController_1.GameController();
router.get('/state/:playerId', gameController.getGameState);
router.post('/join', gameController.joinGame);
router.post('/leave', gameController.leaveGame);
router.get('/leaderboard', gameController.getLeaderboard);
router.post('/player/register', gameController.registerPlayer);
router.get('/player/:wallet', gameController.getPlayer);
router.put('/player/:playerId', gameController.updatePlayer);
//# sourceMappingURL=game.js.map