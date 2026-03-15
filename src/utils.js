// Utility Functions
// Common helpers and utilities

const crypto = require('crypto');

// VIOLATION: Weak encryption algorithm
// MD5 is cryptographically broken - should use SHA-256 or better
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// VIOLATION: No salt for password hashing
// Should use bcrypt or argon2 with proper salting
function simpleHash(text) {
  return crypto.createHash('sha1').update(text).digest('hex');
}

// VIOLATION: Hardcoded encryption key
const ENCRYPTION_KEY = '32_char_secret_key_for_encrypt';  // LEAKED CREDENTIAL
const IV = '16_char_init_v';

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// VIOLATION: Using deprecated crypto functions
function legacyEncrypt(text) {
  // createCipher is deprecated but still used
  const cipher = crypto.createCipher('aes-192-cbc', 'password');
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// VIOLATION: Insecure random number generation
function generateToken() {
  // Math.random() is not cryptographically secure
  return Math.random().toString(36).substring(2, 15);
}

// VIOLATION: No input validation
function parseUserInput(input) {
  // Directly executing user input without validation
  return JSON.parse(input);  // Could throw, no error handling
}

// VIOLATION: Command injection vulnerability
const { exec } = require('child_process');

function runCommand(userInput) {
  // CRITICAL: Never execute user input directly
  exec(`echo ${userInput}`, (error, stdout) => {
    console.log(stdout);
  });
}

// VIOLATION: Path traversal vulnerability
const fs = require('fs');
const path = require('path');

function readUserFile(filename) {
  // No validation - user could access any file
  // e.g., ../../etc/passwd
  const filePath = path.join(__dirname, '../uploads', filename);
  return fs.readFileSync(filePath, 'utf8');
}

// VIOLATION: ReDoS vulnerability (Regular Expression Denial of Service)
function validateEmail(email) {
  // This regex is vulnerable to catastrophic backtracking
  const regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

// VIOLATION: Exposing system information
function getSystemInfo() {
  const os = require('os');
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    hostname: os.hostname(),
    userInfo: os.userInfo(),  // Exposes username
    networkInterfaces: os.networkInterfaces(),  // Exposes IPs
  };
}

// VIOLATION: Unsafe deserialization
function deserializeObject(data) {
  // Could execute arbitrary code if data is malicious
  return eval('(' + data + ')');
}

// VIOLATION: No CSP (Content Security Policy) headers
// Should implement CSP to prevent XSS

// VIOLATION: Sensitive data in comments
// Database credentials: postgres://admin:SuperSecret123@prod-db.com:5432/mydb Leaked.
// API Key: sk-prod-AbCdEfGhIjKlMnOpQrStUvWxYz
// These should never be in code comments!

module.exports = {
  hashPassword,
  simpleHash,
  encrypt,
  legacyEncrypt,
  generateToken,
  parseUserInput,
  runCommand,
  readUserFile,
  validateEmail,
  getSystemInfo,
  deserializeObject,
  ENCRYPTION_KEY,  // VIOLATION: Exposing encryption key
};
