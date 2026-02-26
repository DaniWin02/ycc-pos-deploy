module.exports = {
  apps: [
    {
      name: 'ycc-pos-api',
      script: '03_API_GATEWAY/src/index.ts',
      cwd: '/var/www/ycc-pos/current',
      instances: 'max',
      exec_mode: 'cluster',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://yccpos_user:yccpos_secure_password_2024@localhost:5432/ycc_pos',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        JWT_REFRESH_SECRET: 'your-super-secret-refresh-key-change-in-production',
        CORS_ORIGIN: 'https://pos.yccpos.com,https://kds.yccpos.com,https://admin.yccpos.com',
        LOG_LEVEL: 'info'
      },

      // Enhanced logging configuration
      error_file: '/var/log/ycc-pos/api-error.log',
      out_file: '/var/log/ycc-pos/api-out.log',
      log_file: '/var/log/ycc-pos/api-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      merge_logs: true,
      autorestart: true,

      // Performance and monitoring
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // PM2 monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist', '*.log'],
      watch_options: {
        followSymlinks: false
      },

      // Health checks
      health_check_grace_period: 10000,
      health_check_fatal_exceptions: true,

      // Process management
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Cluster settings
      node_args: '--max-old-space-size=1024 --trace-warnings --trace-uncaught',
      exec_interpreter: 'node',

      // PM2 Plus monitoring (if available)
      pm2_plus: {
        enabled: true,
        bucket: 'ycc-pos-api',
        public_key: process.env.PM2_PLUS_PUBLIC_KEY,
        secret_key: process.env.PM2_PLUS_SECRET_KEY
      }
    }
  ],

  // PM2 configuration
  pm2: {
    log_file: '/var/log/ycc-pos/pm2.log',
    out_file: '/var/log/ycc-pos/pm2-out.log',
    error_file: '/var/log/ycc-pos/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    pid_file: '/var/run/ycc-pos/pm2.pid'
  },

  // Deploy configuration
  deploy: {
    production: {
      user: 'yccpos',
      host: 'pos.yccpos.com',
      ref: 'origin/main',
      repo: 'git@github.com:ycc-pos/ycc-pos.git',
      path: '/var/www/ycc-pos',
      'pre-deploy-local': '',
      'post-deploy': 'cd /var/www/ycc-pos/current && pnpm install --frozen-lockfile && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo mkdir -p /var/log/ycc-pos /var/run/ycc-pos && sudo chown -R $USER:$USER /var/log/ycc-pos /var/run/ycc-pos'
    }
  }
};
