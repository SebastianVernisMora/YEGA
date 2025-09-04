module.exports = {
  apps: [
    {
      name: 'yega-api',
      script: 'backend/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      time: true,
      max_memory_restart: '300M',
      error_file: 'logs/yega-api.err.log',
      out_file: 'logs/yega-api.out.log',
      merge_logs: true,
    },
  ],
};

