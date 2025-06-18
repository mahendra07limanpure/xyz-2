"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./config/config");
const game_1 = require("./routes/game");
const party_1 = require("./routes/party");
const loot_1 = require("./routes/loot");
const ai_1 = require("./routes/ai");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const prisma_1 = require("./database/prisma");
const elizaService_1 = require("./services/elizaService");
const socketService_1 = require("./services/socketService");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/game', game_1.gameRouter);
app.use('/api/party', party_1.partyRouter);
app.use('/api/loot', loot_1.lootRouter);
app.use('/api/ai', ai_1.aiRouter);
app.use(errorHandler_1.errorHandler);
const gameSocketManager = new socketService_1.GameSocketManager(io);
async function startServer() {
    try {
        await (0, prisma_1.initializeDatabase)();
        logger_1.logger.info('Database initialized');
        await (0, elizaService_1.initializeEliza)();
        logger_1.logger.info('ElizaOS initialized');
        gameSocketManager.initialize();
        logger_1.logger.info('Socket service initialized');
        const port = config_1.config.port || 3001;
        server.listen(port, () => {
            logger_1.logger.info(`Server running on port ${port}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=app.js.map