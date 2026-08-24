/**
 * Authentication Mock
 * Provides mock tokens and authentication utilities for testing
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

/**
 * Generate a valid test JWT token
 */
export const generateTestToken = (
  userId: string = 'user-123',
  email: string = 'test@example.com'
): string => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Generate an expired token
 */
export const generateExpiredToken = (): string => {
  return jwt.sign(
    { id: 'user-123', email: 'test@example.com' },
    JWT_SECRET,
    { expiresIn: '-1h' }
  );
};

/**
 * Generate an invalid signature token
 */
export const generateInvalidToken = (): string => {
  return jwt.sign(
    { id: 'user-123', email: 'test@example.com' },
    'wrong-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Test user fixtures
 */
export const testUsers = {
  freeUser: {
    id: 'user-free-123',
    email: 'free@example.com',
    tier: 'free',
  },
  proUser: {
    id: 'user-pro-456',
    email: 'pro@example.com',
    tier: 'pro',
  },
  adminUser: {
    id: 'user-admin-789',
    email: 'admin@example.com',
    tier: 'admin',
  },
};

/**
 * Mock request with authentication
 */
export const createMockRequest = (
  userId: string = 'user-123',
  email: string = 'test@example.com'
) => ({
  user: { id: userId, email },
  headers: {
    authorization: `Bearer ${generateTestToken(userId, email)}`,
  },
});

/**
 * Mock verifyToken middleware response scenarios
 */
export const authMockScenarios = {
  validToken: {
    middleware: (req: any, res: any, next: any) => {
      req.user = { id: 'user-123', email: 'test@example.com' };
      next();
    },
  },
  missingToken: {
    middleware: (req: any, res: any) => {
      res.status(401).json({ error: 'No token provided' });
    },
  },
  invalidToken: {
    middleware: (req: any, res: any) => {
      res.status(401).json({ error: 'Invalid token' });
    },
  },
};
