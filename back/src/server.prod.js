import app from "./app.prod.js";
import { createServer } from "http";
import cluster from "cluster";
import os from "os";
import { createLogger, format, transports } from "winston";
import { initSocket } from "./modules/realtime/socket.js";

// Production logger
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "civilbridge-server" },
  transports: [
    new transports.File({ filename: "logs/server.log" }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
  ],
});

// Graceful shutdown handler
const gracefulShutdown = (server, signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error("Error during server shutdown:", err);
      process.exit(1);
    }
    
    logger.info("HTTP server closed");
    
    // Close database connections
    import("./config/prisma.js").then(({ prisma }) => {
      prisma.$disconnect()
        .then(() => {
          logger.info("Database disconnected");
          process.exit(0);
        })
        .catch((err) => {
          logger.error("Error disconnecting from database:", err);
          process.exit(1);
        });
    });
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

// Single process mode (for development or small deployments)
const startSingleProcess = () => {
  const PORT = process.env.PORT || 3000;
  const server = createServer(app);
  initSocket(server);
  
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`Process ID: ${process.pid}`);
  });
  
  // Handle graceful shutdown
  process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
  
  // Handle uncaught exceptions
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    gracefulShutdown(server, "uncaughtException");
  });
  
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
};

// Cluster mode (for production with multiple CPU cores)
const startCluster = () => {
  const numCPUs = os.cpus().length;
  
  if (cluster.isMaster) {
    logger.info(`Master ${process.pid} is running`);
    logger.info(`Starting ${numCPUs} workers`);
    
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    // Handle worker crashes
    cluster.on("exit", (worker, code, signal) => {
      logger.warn(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
      logger.info("Starting a new worker");
      cluster.fork();
    });
    
    // Handle master shutdown
    process.on("SIGTERM", () => {
      logger.info("Master received SIGTERM, shutting down workers...");
      for (const id in cluster.workers) {
        cluster.workers[id].kill("SIGTERM");
      }
      process.exit(0);
    });
    
    process.on("SIGINT", () => {
      logger.info("Master received SIGINT, shutting down workers...");
      for (const id in cluster.workers) {
        cluster.workers[id].kill("SIGINT");
      }
      process.exit(0);
    });
    
  } else {
    // Worker process
    const PORT = process.env.PORT || 3000;
    const server = createServer(app);
    initSocket(server);
    
    server.listen(PORT, () => {
      logger.info(`Worker ${process.pid} started on port ${PORT}`);
    });
    
    // Handle worker shutdown
    process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
    
    process.on("uncaughtException", (err) => {
      logger.error(`Worker ${process.pid} Uncaught Exception:`, err);
      gracefulShutdown(server, "uncaughtException");
    });
    
    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`Worker ${process.pid} Unhandled Rejection:`, reason);
    });
  }
};

// Start server based on environment
if (process.env.NODE_ENV === "production" && process.env.CLUSTER_MODE !== "false") {
  startCluster();
} else {
  startSingleProcess();
}
