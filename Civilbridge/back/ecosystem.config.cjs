/**
 * PM2 Ecosystem Configuration — CivilBridge API
 *
 * Production cluster mode:
 *   pm2 start ecosystem.config.cjs --env production
 *
 * Development (single process, watch mode):
 *   pm2 start ecosystem.config.cjs --env development
 *
 * Other useful commands:
 *   pm2 logs civilbridge-api
 *   pm2 monit
 *   pm2 reload civilbridge-api   ← zero-downtime reload
 *   pm2 stop  civilbridge-api
 *   pm2 delete civilbridge-api
 */
module.exports = {
  apps: [
    {
      name:           "civilbridge-api",
      script:         "src/server.js",

      // Spawn one worker per CPU core in production
      instances:      "max",
      exec_mode:      "cluster",

      // Use Node's built-in ESM loader (package.json has "type":"module")
      node_args:      "--experimental-specifier-resolution=node",

      // Restart policy
      autorestart:    true,
      max_restarts:   10,
      restart_delay:  3000,
      min_uptime:     "5s",

      // Memory threshold before automatic restart
      max_memory_restart: "512M",

      // Graceful shutdown timeout (ms)
      kill_timeout:   10000,
      listen_timeout: 8000,

      // Log files (picked up by log shipper / aggregator)
      out_file:       "logs/pm2-out.log",
      error_file:     "logs/pm2-error.log",
      merge_logs:     true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Environment overrides
      env: {
        NODE_ENV: "development",
        PORT:     3000,
      },
      env_production: {
        NODE_ENV:       "production",
        PORT:           3000,
        // All secrets come from the OS environment / secret manager
        // Do NOT hardcode values here
      },

      // Watch mode for development (disabled in production)
      watch:        false,
      ignore_watch: ["node_modules", "logs", "uploads", ".env*"],
    },
  ],
};
