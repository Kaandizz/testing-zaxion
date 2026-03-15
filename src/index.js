// Main API Server
// Author: Demo Developer
//1

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// VIOLATION 1: Hardcoded database credentials
// TODO: Move to environment variables
const pool = new Pool({
  host: 'prod-db.company.com',
  port: 5432,
  database: 'production_db',
  user: 'admin',
  password: 'SuperSecret123!@#ProductionPassword',  // LEAKED CREDENTIAL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// VIOLATION 2: Hardcoded JWT secret
// FIXME: This should be in .env file
const JWT_SECRET = 'my-super-secret-jwt-key-production-2024-do-not-share';

// VIOLATION 3: Hardcoded API keys
const STRIPE_SECRET_KEY = 'sk_live_51MXqL2SJ3m4hGpYxKL9M8N7O6P5Q4R3S2T1U0';
const OPENAI_API_KEY = 'sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// VIOLATION 4: Missing input validation
// No validation on user input - security risk
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  
  // VIOLATION 5: SQL Injection vulnerability
  // Using string concatenation instead of parameterized queries
  const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
  
  try {
    await pool.query(query);
    res.json({ success: true });
  } catch (error) {
    // VIOLATION 6: Exposing internal error details to client
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// VIOLATION 7: Missing authentication middleware
// This endpoint should require authentication but doesn't
app.get('/api/admin/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

// VIOLATION 8: Weak password validation
// Accepts any password without requirements
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  // No password strength check
  // No minimum length requirement
  // No complexity requirements
  
  const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
  await pool.query(query, [username, password]);
  
  res.json({ success: true });
});

// VIOLATION 9: Missing error handling
// Function doesn't have try-catch blocks
function processPayment(amount, cardToken) {
  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  
  // This will crash the server if it fails
  const charge = stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: cardToken,
  });
  
  return charge;
}

// VIOLATION 10: Using eval() - extremely dangerous
// Never use eval() in production code
app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;
  
  // CRITICAL SECURITY ISSUE: eval allows arbitrary code execution
  const result = eval(expression);
  
  res.json({ result });
});

// VIOLATION 11: Logging sensitive data
// Passwords should never be logged
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // BAD: Logging password in plaintext
  console.log(`Login attempt: username=${username}, password=${password}`);
  
  const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
  const result = await pool.query(query, [username, password]);
  
  if (result.rows.length > 0) {
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// VIOLATION 12: Missing rate limiting
// No protection against brute force attacks
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;
  
  // Anyone can spam this endpoint
  // No CAPTCHA, no rate limiting
  
  // Send password reset email...
  res.json({ message: 'Password reset email sent' });
});

// VIOLATION 13: Insecure random token generation
// Using Math.random() for security tokens is insecure
function generateResetToken() {
  return Math.random().toString(36).substring(7);
}

// VIOLATION 14: Missing HTTPS enforcement
// Should redirect HTTP to HTTPS in production
// No helmet.js for security headers

// VIOLATION 15: Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';  // LEAKED CREDENTIAL

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// VIOLATION 16: Missing input sanitization
// XSS vulnerability - user input not sanitized
app.post('/api/comments', async (req, res) => {
  const { comment } = req.body;
  
  // Storing user input without sanitization
  // Could contain malicious scripts
  const query = 'INSERT INTO comments (text) VALUES ($1)';
  await pool.query(query, [comment]);
  
  res.json({ success: true });
});

// VIOLATION 17: Information disclosure
// Exposing internal implementation details
app.get('/api/debug/config', (req, res) => {
  res.json({
    database: {
      host: pool.options.host,
      database: pool.options.database,
      user: pool.options.user,
      // Exposing password in debug endpoint
      password: pool.options.password,
    },
    jwtSecret: JWT_SECRET,
    apiKeys: {
      stripe: STRIPE_SECRET_KEY,
      openai: OPENAI_API_KEY,
    },
    environment: 'production',
  });
});

// VIOLATION 18: Missing CORS configuration
// Allows requests from any origin
// Should restrict to specific domains

// VIOLATION 19: No request size limit
// Vulnerable to DOS attacks via large payloads

// VIOLATION 20: Using deprecated functions
// Some crypto functions are deprecated but still in use

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${pool.options.database}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);  // VIOLATION: Logging credentials
});

module.exports = app;
