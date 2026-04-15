{
  "apps": [
    {
      "name": "civilbridge-api",
      "script": "./src/server.prod.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "env_development": {
        "NODE_ENV": "development",
        "PORT": 3001
      },
      "log_file": "./logs/combined.log",
      "out_file": "./logs/out.log",
      "error_file": "./logs/error.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true,
      "max_memory_restart": "1G",
      "node_args": "--max-old-space-size=1024",
      "watch": false,
      "ignore_watch": [
        "node_modules",
        "logs",
        "uploads",
        ".git"
      ],
      "restart_delay": 4000,
      "max_restarts": 10,
      "min_uptime": "10s",
      "autorestart": true,
      "kill_timeout": 5000,
      "wait_ready": true,
      "listen_timeout": 10000,
      "cron_restart": "0 2 * * *",
      "post_update": [
        "npm install --production",
        "npm run build"
      ]
    }
  ],
  "deploy": {
    "production": {
      "user": "deploy",
      "host": ["your-server-ip"],
      "ref": "origin/main",
      "repo": "git@github.com:your-username/civilbridge.git",
      "path": "/var/www/civilbridge",
      "pre-deploy-local": "",
      "post-deploy": [
        "npm install --production",
        "npm run build",
        "pm2 reload ecosystem.config.js --env production"
      ],
      "pre-setup": "",
      "ssh_options": "StrictHostKeyChecking=no"
    },
    "staging": {
      "user": "deploy",
      "host": ["staging-server-ip"],
      "ref": "origin/develop",
      "repo": "git@github.com:your-username/civilbridge.git",
      "path": "/var/www/civilbridge-staging",
      "post-deploy": [
        "npm install --production",
        "npm run build",
        "pm2 reload ecosystem.config.js --env staging"
      ]
    }
  }
}
