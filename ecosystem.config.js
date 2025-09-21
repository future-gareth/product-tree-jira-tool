module.exports = {
  apps: [{
    name: 'product-tree-jira',
    script: 'server.js',
    cwd: '/var/www/garethapi/tools/product-tree-from-jira',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/var/log/pm2/product-tree-jira-error.log',
    out_file: '/var/log/pm2/product-tree-jira-out.log',
    log_file: '/var/log/pm2/product-tree-jira.log'
  }]
};
