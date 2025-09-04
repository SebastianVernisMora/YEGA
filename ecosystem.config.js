const path = require('path');
const backendCwd = path.resolve(__dirname, 'backend');

module.exports = {
  apps: [
    {
      name: 'yega-api',
      script: 'server.js',
      cwd: backendCwd,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      time: true,
      max_memory_restart: '300M',
      error_file: path.resolve(__dirname, 'logs/yega-api.err.log'),
      out_file: path.resolve(__dirname, 'logs/yega-api.out.log'),
      merge_logs: true,
    },
  ],
};
