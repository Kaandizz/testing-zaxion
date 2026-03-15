// Database Configuration
// Connection pooling and query helpers

const { Pool } = require('pg');

// VIOLATION: Production database credentials hardcoded
// This should use environment variables or secrets manager
const dbConfig = {
  production: {
    host: 'prod-postgres.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'production_app',
    user: 'prod_admin',
    password: 'Pr0d_DB_P@ssw0rd_2024_Secret!',  // LEAKED CREDENTIAL
    ssl: true,
    max: 20,
    idleTimeoutMillis: 30000,
  },
  staging: {
    host: 'staging-db.internal',
    port: 5432,
    database: 'staging_app',
    user: 'staging_user',
    password: 'Staging_Pass_123',  // LEAKED
    max: 10,
  },
  development: {
    host: 'localhost',
    port: 5432,
    database: 'dev_app',
    user: 'dev_user',
    password: 'dev_password',
    max: 5,
  },
};

// VIOLATION: Using production config by default
const currentEnv = process.env.NODE_ENV || 'production';
const config = dbConfig[currentEnv];

const pool = new Pool(config);

// VIOLATION: No error handling on pool connection
pool.on('error', (err) => {
  // Just logging, not handling properly
  console.error('Database error:', err);
  console.error('Config:', config);  // Logging credentials
});

// VIOLATION: Synchronous query helper without timeout
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // VIOLATION: Logging queries with potential sensitive data
  console.log('Executed query:', text);
  console.log('Query params:', params);  // Could contain passwords, PII
  console.log('Duration:', duration, 'ms');
  
  return res;
}

// VIOLATION: Raw SQL without sanitization
function getRawQuery(tableName, conditions) {
  // SQL Injection vulnerability
  return `SELECT * FROM ${tableName} WHERE ${conditions}`;
}

module.exports = {
  pool,
  query,
  getRawQuery,
  dbConfig,  // VIOLATION: Exposing config with passwords
};
