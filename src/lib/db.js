const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'uniapp',
  password: process.env.POSTGRES_PASSWORD || '4440200',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

module.exports = pool; 