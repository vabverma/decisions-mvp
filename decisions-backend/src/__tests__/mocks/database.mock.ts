/**
 * Database Mock
 * Provides mock implementations of database operations for testing
 */

export const mockPoolQuery = () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  release: jest.fn(),
});

/**
 * Mock user query results
 */
export const mockUserResults = {
  free: {
    rows: [
      {
        id: 'user-123',
        email: 'test@example.com',
        subscription_tier: 'free',
      },
    ],
  },
  pro: {
    rows: [
      {
        id: 'user-456',
        email: 'pro@example.com',
        subscription_tier: 'pro',
      },
    ],
  },
  notFound: {
    rows: [],
  },
};

/**
 * Mock usage tracking results
 */
export const mockUsageResults = {
  belowLimit: {
    rows: [
      {
        user_id: 'user-123',
        recommendations_this_month: 3,
      },
    ],
  },
  atLimit: {
    rows: [
      {
        user_id: 'user-123',
        recommendations_this_month: 5,
      },
    ],
  },
  aboveLimit: {
    rows: [
      {
        user_id: 'user-123',
        recommendations_this_month: 6,
      },
    ],
  },
  notFound: {
    rows: [],
  },
};

/**
 * Mock product insert results
 */
export const mockProductResults = {
  success: {
    rows: [
      {
        id: 'product-123',
        user_id: 'user-123',
        product_name: 'Test Product',
      },
    ],
  },
  notFound: {
    rows: [],
  },
};

/**
 * Mock recommendation insert results
 */
export const mockRecommendationResults = {
  success: {
    rows: [
      {
        id: 'recommendation-123',
        user_id: 'user-123',
        product_id: 'product-123',
        recommended_price: 99.99,
      },
    ],
  },
  notFound: {
    rows: [],
  },
};

/**
 * Helper to setup mock pool queries
 */
export const setupMockPoolQuery = (
  mockPool: any,
  queries: Record<string, any>
) => {
  mockPool.query.mockImplementation((sql: string, params?: any[]) => {
    for (const [key, result] of Object.entries(queries)) {
      if (sql.includes(key)) {
        return Promise.resolve(result);
      }
    }
    return Promise.resolve({ rows: [] });
  });
};

/**
 * Helper to track and assert query calls
 */
export const assertQueryCalled = (
  mockPool: any,
  sqlPattern: string,
  params?: any
) => {
  const calls = mockPool.query.mock.calls;
  const found = calls.some(
    ([sql, queryParams]: [string, any[]]) =>
      sql.includes(sqlPattern) &&
      (!params || JSON.stringify(queryParams) === JSON.stringify(params))
  );
  expect(found).toBe(true);
};
