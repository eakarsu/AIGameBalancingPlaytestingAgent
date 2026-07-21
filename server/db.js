const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'game_balancing_agent',
  user: process.env.DB_USER || 'erolakarsu',
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
