/**
 * Test Setup
 * Runs before all tests to configure environment and utilities
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Keep error logging for debugging but reduce noise
  if (process.env.DEBUG_TESTS !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn((message?: any, ...optionalParams: any[]) => {
      // Only log critical errors
      if (message?.includes('CRITICAL') || message?.includes('ERROR')) {
        originalConsoleError(message, ...optionalParams);
      }
    });
  }
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test utilities
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Suppress specific console messages in test output
process.env.NODE_ENV = 'test';
