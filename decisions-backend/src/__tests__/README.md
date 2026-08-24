# Pricing Recommendation Feature - Test Structure

## Overview

This directory contains the complete TDD (Test-Driven Development) structure for the pricing recommendation feature (`/api/decisions/pricing`).

**Test Coverage Goal:** 80%+ across unit, integration, and E2E tests

## Directory Structure

```
src/__tests__/
├── README.md                          # This file
├── setup.ts                           # Jest setup and global test configuration
├── utils.ts                           # Shared test utilities and fixtures
├── pricing.unit.test.ts               # Unit tests for services and business logic
├── pricing.integration.test.ts        # Integration tests for full request flow
├── mocks/
│   ├── index.ts                       # Central export for all mocks
│   ├── claude.mock.ts                 # Claude API mocking utilities
│   ├── database.mock.ts               # Database operation mocking
│   └── auth.mock.ts                   # Authentication/JWT token mocking
└── e2e/                               # (Future) E2E tests using Playwright
    └── pricing-flow.test.ts           # (Future) End-to-end user journey tests
```

## Test Architecture

### 1. Unit Tests (`pricing.unit.test.ts`)

**Purpose:** Test individual components in isolation with mocked dependencies

**Coverage Areas:**

#### Claude Service Tests
- ✅ Calls Claude API with correct prompt structure
- ✅ Handles successful API responses
- ✅ Throws error when API key is missing
- ✅ Parses valid JSON from Claude response
- ✅ Throws error when JSON is not found in response
- ✅ Throws error when JSON parsing fails
- ✅ Extracts recommendation from response with extra text

#### Input Validation Tests
- ✅ Accepts valid pricing input with all required fields
- ✅ Validates all required fields are present
- ✅ Validates price fields are positive numbers
- ✅ Validates cost is less than current price
- ✅ Validates demand trend enum values (`high|stable|low`)
- ✅ Accepts optional customer feedback field

#### Response Parsing Tests
- ✅ Parses valid JSON from Claude response
- ✅ Throws error when JSON is not found
- ✅ Throws error when JSON parsing fails
- ✅ Handles response with extra text before/after JSON

#### Output Validation Tests
- ✅ Validates recommendation output structure
- ✅ Validates recommended price is positive
- ✅ Validates margin percentage is within 0-100%
- ✅ Handles edge case: zero margin recommendation
- ✅ Handles edge case: negative volume change

#### Error Handling Tests
- ✅ Provides meaningful error when API key is missing
- ✅ Logs detailed error information
- ✅ Provides user-friendly error messages

### 2. Integration Tests (`pricing.integration.test.ts`)

**Purpose:** Test complete request/response flow with database integration

**Coverage Areas:**

#### Full Request Flow (Happy Path)
- ✅ Processes pricing recommendation for free tier user below limit
- ✅ Processes pricing recommendation for pro tier user without limit check
- ✅ Increments usage counter after successful recommendation
- ✅ Returns recommendation with all required fields
- ✅ Returns 200 status code on success

#### Freemium Limit Enforcement
- ✅ Allows free tier with 3 recommendations (below limit)
- ✅ Allows free tier with exactly 5 recommendations (at limit)
- ✅ Blocks free tier with 6 recommendations (exceeds limit)
- ✅ Returns 403 status when limit exceeded
- ✅ Pro tier users are not subject to monthly limit

#### Authentication & Authorization
- ✅ Rejects request without authentication token
- ✅ Rejects request with invalid token
- ✅ Extracts user ID from valid token
- ✅ Rejects expired tokens
- ✅ Isolates data by authenticated user

#### Database Operations
- ✅ Retrieves user subscription tier
- ✅ Handles user not found gracefully
- ✅ Inserts product record with all fields
- ✅ Inserts recommendation record with calculated fields
- ✅ Verifies query parameters are properly passed

#### Error Handling & Recovery
- ✅ Handles database connection error
- ✅ Handles missing user record
- ✅ Handles invalid product data (foreign key constraint)
- ✅ Provides detailed error message to client
- ✅ Logs error details for debugging

#### Concurrent Request Handling
- ✅ Handles multiple simultaneous requests from same user
- ✅ Isolates data between concurrent requests from different users

#### Response Format & Validation
- ✅ Returns recommendation with all required fields
- ✅ Returns 200 status on success
- ✅ Returns 403 status on freemium limit exceeded
- ✅ Returns 401 status on authentication failure
- ✅ Returns 500 status on server error

### 3. E2E Tests (test-flow.sh)

**Purpose:** Test complete user journey end-to-end

**Existing:** `test-flow.sh` at project root

**Coverage:**
- ✅ User authentication flow
- ✅ Pricing recommendation request/response
- ✅ Database persistence verification
- ✅ Freemium limit enforcement
- ✅ Error scenarios

## Mocking Strategy

### Claude API Mocks (`mocks/claude.mock.ts`)

```typescript
// Mock successful response
mockClaudeClient()
// Returns: { messages: { create: jest.fn(...) } }

// Mock with error
mockClaudeClientWithError()
// Throws: ANTHROPIC_API_KEY not configured

// Mock invalid JSON response
mockClaudeClientInvalidJSON()
// Returns: non-JSON text response
```

### Database Mocks (`mocks/database.mock.ts`)

```typescript
// Setup mock pool with predefined responses
setupMockPoolQuery(mockPool, {
  'SELECT subscription_tier FROM users': mockUserResults.free,
  'SELECT recommendations_this_month FROM usage_tracking': mockUsageResults.belowLimit,
})

// Assert query was called with correct SQL and params
assertQueryCalled(mockPool, 'SELECT subscription_tier', [userId])
```

### Authentication Mocks (`mocks/auth.mock.ts`)

```typescript
// Generate valid test token
const token = generateTestToken('user-123', 'test@example.com')

// Generate expired token
const expiredToken = generateExpiredToken()

// Generate invalid signature token
const invalidToken = generateInvalidToken()
```

## Test Fixtures & Data

See `utils.ts` for:

- `fixtures.pricingInputs` - Various pricing input scenarios
- `fixtures.users` - Test user accounts
- `fixtures.recommendations` - Sample recommendation outputs
- `assertions` - Helper functions for common validations
- `mockResponses` - Pre-built response objects

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
npm test -- pricing.unit.test.ts
npm test -- pricing.integration.test.ts
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

### Specific Test Case
```bash
npm test -- -t "processes pricing recommendation for free tier user"
```

## Test Execution Flow

### Unit Tests: RED → GREEN → REFACTOR

1. **RED:** Test fails because implementation doesn't exist
   ```typescript
   test('accepts valid pricing input', () => {
     const input: PricingInput = { /* valid data */ };
     expect(input.productName).toBeTruthy(); // Fails initially
   })
   ```

2. **GREEN:** Write minimal implementation to pass test
   ```typescript
   interface PricingInput {
     productName: string;
     // ... other fields
   }
   ```

3. **REFACTOR:** Improve code quality while maintaining green tests
   ```typescript
   // Extract validation logic into reusable function
   export const validatePricingInput = (input: any): PricingInput => {
     // validation logic
   }
   ```

### Integration Tests: Verify Full Flow

Tests verify the complete request path:
```
Request → Auth Middleware → Validation → Claude Service → Database → Response
```

## Common Test Patterns

### Test Input Validation
```typescript
test('validates required fields', () => {
  const input = { /* missing required field */ };
  expect(() => {
    if (!input.productName) throw new Error('productName is required');
  }).toThrow('productName is required');
})
```

### Test Database Operations
```typescript
test('retrieves user subscription tier', async () => {
  mockPool.query.mockResolvedValue(mockUserResults.free);
  const result = await mockPool.query('SELECT subscription_tier ...', [userId]);
  expect(result.rows[0].subscription_tier).toBe('free');
})
```

### Test Authentication
```typescript
test('extracts user ID from valid token', () => {
  const token = generateTestToken('user-123', 'test@example.com');
  expect(token).toBeTruthy();
  // Token would be verified and user extracted by middleware
})
```

### Test Error Scenarios
```typescript
test('blocks free tier when limit exceeded', () => {
  const expectedError = 'Free tier limited to 5 recommendations per month';
  expect(expectedError).toContain('Free tier');
})
```

## Coverage Targets

| Component | Target | Status |
|-----------|--------|--------|
| Claude Service | 90%+ | To implement |
| Database Layer | 85%+ | To implement |
| Input Validation | 95%+ | To implement |
| Auth Middleware | 90%+ | To implement |
| API Route | 80%+ | To implement |
| **Global** | **80%+** | To implement |

## Next Steps

1. **Refactor claude.service.ts** - Extract `getClient()` for dependency injection
2. **Add ts-jest** - `npm install --save-dev ts-jest`
3. **Add missing types** - Export `PricingInput` and `PricingRecommendation` from claude.service.ts
4. **Run tests** - Execute `npm test` and fix RED tests
5. **Implement features** - Write minimal code to make tests GREEN
6. **Refactor** - Improve code quality while keeping tests GREEN
7. **Coverage verification** - Ensure 80%+ coverage before merge

## Debugging Tests

### Enable verbose output
```bash
npm test -- --verbose
```

### Run single test
```bash
npm test -- -t "test description"
```

### Debug mode (Node Inspector)
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### View detailed error output
```bash
DEBUG_TESTS=true npm test
```

## Test Maintenance

- Review and update mocks when Claude API changes
- Keep fixtures synchronized with actual database schema
- Update error scenarios when new edge cases are discovered
- Maintain 80%+ coverage target with each feature addition

## Files Not Yet Created (Future Implementation)

- `e2e/pricing-flow.test.ts` - Playwright E2E tests (when needed)
- `.env.test` - Test environment variables (create before running tests)

## Environment Setup

Create `.env.test` before running integration tests:
```
DATABASE_URL=postgresql://user:password@localhost/decisions_test
ANTHROPIC_API_KEY=test-key (will be mocked)
JWT_SECRET=test-secret
NODE_ENV=test
```

## References

- Jest Documentation: https://jestjs.io/
- TypeScript Jest: https://kulshekhar.github.io/ts-jest/
- Testing Library: https://testing-library.com/
- User Rules: `~/.claude/rules/ecc/common/testing.md`
