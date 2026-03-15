// Authentication Middleware
// JWT token validation and user authentication

const jwt = require('jsonwebtoken');

// VIOLATION: Hardcoded JWT secret (should be in env)
const JWT_SECRET = 'my-super-secret-jwt-key-production-2024-do-not-share';
const JWT_REFRESH_SECRET = 'refresh-token-secret-key-prod-2024';

// VIOLATION: Weak token expiration (7 days is too long for production)
const TOKEN_EXPIRY = '7d';

// VIOLATION: Missing token revocation mechanism
// No blacklist or refresh token rotation

function generateToken(user) {
  // VIOLATION: Including sensitive data in JWT payload
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,  // CRITICAL: Never include password in token!
    role: user.role,
    ssn: user.ssn,  // CRITICAL: Never include PII in token!
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// VIOLATION: No rate limiting on token verification
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // VIOLATION: Exposing error details
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// VIOLATION: Middleware doesn't validate token properly
function authenticateRequest(req, res, next) {
  const token = req.headers.authorization;
  
  // VIOLATION: Not checking for Bearer prefix
  // Should be: const token = authHeader.split(' ')[1];
  
  if (!token) {
    // VIOLATION: Generic error message (should be more specific)
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    
    // VIOLATION: Logging sensitive token data
    console.log('Authenticated user:', decoded);
    console.log('User password from token:', decoded.password);
    
    next();
  } catch (error) {
    // VIOLATION: Exposing stack trace to client
    res.status(403).json({ 
      error: 'Invalid token',
      details: error.message,
      stack: error.stack,
    });
  }
}

// VIOLATION: No CSRF protection
// Should implement CSRF tokens for state-changing operations

// VIOLATION: Insecure session management
const activeSessions = {};  // VIOLATION: Storing sessions in memory (not scalable)

function createSession(userId) {
  // VIOLATION: Predictable session ID
  const sessionId = `session_${userId}_${Date.now()}`;
  
  activeSessions[sessionId] = {
    userId,
    createdAt: new Date(),
    // VIOLATION: No session expiration
    // VIOLATION: No secure flag
    // VIOLATION: No httpOnly flag
  };
  
  return sessionId;
}

// VIOLATION: Admin bypass (backdoor)
const ADMIN_BYPASS_TOKEN = 'admin-bypass-token-2024-emergency-access';

function checkAdminAccess(req, res, next) {
  const bypassToken = req.headers['x-admin-bypass'];
  
  // VIOLATION: Hardcoded bypass token
  if (bypassToken === ADMIN_BYPASS_TOKEN) {
    req.user = { role: 'admin', username: 'superadmin' };
    return next();
  }
  
  // VIOLATION: Not checking if user actually has admin role
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateRequest,
  checkAdminAccess,
  createSession,
  JWT_SECRET,  // VIOLATION: Exposing secret
  JWT_REFRESH_SECRET,  // VIOLATION: Exposing secret
  ADMIN_BYPASS_TOKEN,  // VIOLATION: Exposing bypass token
};
