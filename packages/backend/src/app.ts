import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/config';
import { gameRouter } from './routes/game';
import { partyRouter } from './routes/party';
import { lootRouter } from './routes/loot';
import { aiRouter } from './routes/ai';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeDatabase } from './database/prisma';
import { initializeEliza } from './services/elizaService';
import { GameSocketManager } from './services/socketService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/game', gameRouter);
app.use('/api/party', partyRouter);
app.use('/api/loot', lootRouter);
app.use('/api/ai', aiRouter);

// Error handling
app.use(errorHandler);

// Initialize services
const gameSocketManager = new GameSocketManager(io);

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized');

    // Initialize AI service
    await initializeEliza();
    logger.info('ElizaOS initialized');

    // Initialize socket service
    gameSocketManager.initialize();
    logger.info('Socket service initialized');

    const port = config.port || 3001;
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
