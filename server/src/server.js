import './config/env.js'; // Validate env vars before anything else
import { connectDatabase } from './config/database.js';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function start() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`Nexus server running`, {
        port: env.PORT,
        env: env.NODE_ENV,
        ai: env.AI_ENABLED ? `enabled (${env.LLM_MODEL})` : 'disabled',
      });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        const { disconnectDatabase } = await import('./config/database.js');
        await disconnectDatabase();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { message: err.message });
    process.exit(1);
  }
}

start();

