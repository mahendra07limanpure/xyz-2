import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient | null = null;

export async function initializeDatabase(): Promise<PrismaClient> {
  try {
    if (prisma) {
      return prisma;
    }
    
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

    await prisma.$connect();
    logger.info('Database connected successfully');
    
    return prisma;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
}

// Initialize database immediately if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase().catch(console.error);
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Database disconnected');
  }
}
