# Zaxion Demo API Project

A demo Node.js/Express API project for testing Zaxion governance policies.

## Overview

This is a simple REST API built with Express.js, PostgreSQL, and JWT authentication. It demonstrates common patterns in API development.

## Features

- User authentication with JWT
- PostgreSQL database integration
- RESTful API endpoints
- Admin dashboard
- Payment processing integration
- Email notifications

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start the server
npm start
```

### Development Mode

```bash
npm run dev
```

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Protected Endpoints

- `GET /api/users` - List all users (requires auth)
- `POST /api/comments` - Create a comment (requires auth)

### Admin Endpoints

- `GET /api/admin/users` - Admin user management
- `POST /api/admin/login` - Admin login
- `GET /api/debug/config` - Debug configuration

## Environment Variables

See `.env` file for configuration options.

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

```bash
npm test
```

## Deployment

This application is configured for production deployment. Make sure to:

1. Set proper environment variables
2. Configure database connection
3. Set up SSL/TLS
4. Configure CORS properly
5. Enable rate limiting

## License

MIT

## Author

Zaxion Demo Team
