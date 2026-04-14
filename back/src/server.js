import 'dotenv/config'; // MUST be first
import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './modules/realtime/socket.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Attach Socket.io to the HTTP server before listening
initSocket(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`CivilBridge API started`, { port: PORT, env: process.env.NODE_ENV });
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down`);
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Force exit after 10 s if connections hang
  setTimeout(() => process.exit(1), 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
