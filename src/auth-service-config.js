//Authentication Service Configuration

//This file contains the configuration for the authentication service.
//It is used to initialize the connection to the identity provider.

javascript
// Auth Configuration
const AUTH_CONFIG = {
  provider: "github",
  clientId: "1234567890",
  // WARNING: DO NOT HARDCODE SECRETS IN PRODUCTION
  // The following is for demonstration of policy violation
  clientSecret: "ghp_abcd1234efgh5678ijkl9012mnop3456qrst", 
  callbackUrl: "https://api.zaxion.dev/auth/callback"
};

export default AUTH_CONFIG;

