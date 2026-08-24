/**
 * Test Utilities
 * Shared helpers and utilities for all tests
 */

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create test data fixtures
 */
export const fixtures = {
  pricingInputs: {
    basic: {
      productName: 'Basic Widget',
      currentPrice: 50.0,
      cost: 25.0,
      competitorPrice: 48.0,
      monthlyVolume: 1000,
      demandTrend: 'stable' as const,
    },
    highDemand: {
      productName: 'Premium Product',
      currentPrice: 199.99,
      cost: 80.0,
      competitorPrice: 189.99,
      monthlyVolume: 5000,
      demandTrend: 'high' as const,
      customerFeedback: 'Excellent reviews, high demand',
    },
    lowDemand: {
      productName: 'Budget Item',
      currentPrice: 9.99,
      cost: 3.0,
      competitorPrice: 8.99,
      monthlyVolume: 100,
      demandTrend: 'low' as const,
      customerFeedback: 'Slow sales, price sensitive market',
    },
  },

  users: {
    freeUser: {
      id: 'user-free-1',
      email: 'free@test.com',
      subscriptionTier: 'free',
    },
    proUser: {
      id: 'user-pro-1',
      email: 'pro@test.com',
      subscriptionTier: 'pro',
    },
  },

  recommendations: {
    moderate: {
      recommendedPrice: 99.99,
      reasoning: 'Balanced pricing for market position',
      projectedMargin: 50,
      projectedMonthlyRevenue: 4999.5,
      priceChange: 10,
      projectedVolumeChange: -5,
      annualImpact: 5000,
    },
    aggressive: {
      recommendedPrice: 149.99,
      reasoning: 'Premium positioning to maximize margin',
      projectedMargin: 70,
      projectedMonthlyRevenue: 5249.65,
      priceChange: 50,
      projectedVolumeChange: -30,
      annualImpact: 12000,
    },
    conservative: {
      recommendedPrice: 79.99,
      reasoning: 'Competitive pricing to increase volume',
      projectedMargin: 40,
      projectedMonthlyRevenue: 3999.5,
      priceChange: -20,
      projectedVolumeChange: 25,
      annualImpact: 8000,
    },
  },
};

/**
 * Assertions for common test scenarios
 */
export const assertions = {
  isValidPricingRecommendation: (rec: any): boolean => {
    return (
      typeof rec.recommendedPrice === 'number' &&
      rec.recommendedPrice > 0 &&
      typeof rec.reasoning === 'string' &&
      rec.reasoning.length > 0 &&
      typeof rec.projectedMargin === 'number' &&
      rec.projectedMargin >= 0 &&
      rec.projectedMargin <= 100 &&
      typeof rec.projectedMonthlyRevenue === 'number' &&
      rec.projectedMonthlyRevenue >= 0 &&
      typeof rec.annualImpact === 'number'
    );
  },

  isValidUserRecord: (user: any): boolean => {
    return (
      typeof user.id === 'string' &&
      user.id.length > 0 &&
      typeof user.email === 'string' &&
      user.email.includes('@') &&
      ['free', 'pro', 'enterprise'].includes(user.subscription_tier)
    );
  },

  isWithinFreemiumLimit: (count: number): boolean => {
    return count < 5;
  },
};

/**
 * Performance testing utilities
 */
export const performance = {
  measureTime: async (fn: () => Promise<any>): Promise<number> => {
    const start = performance.now();
    await fn();
    return performance.now() - start;
  },

  expectFastResponse: (ms: number, threshold: number = 1000): boolean => {
    return ms < threshold;
  },
};

/**
 * Error scenario generators
 */
export const errorScenarios = {
  missingApiKey: (): Error => new Error('ANTHROPIC_API_KEY not configured'),
  databaseError: (): Error => new Error('Database connection failed'),
  invalidJson: (): Error => new Error('No JSON found in response'),
  freemiumLimitExceeded: (): Error =>
    new Error('Free tier limited to 5 recommendations per month'),
};

/**
 * Mock response generators
 */
export const mockResponses = {
  successfulRecommendation: (override?: any) => ({
    status: 200,
    data: {
      id: 'rec-123',
      productId: 'product-123',
      ...fixtures.recommendations.moderate,
      ...override,
    },
  }),

  freemiumLimitError: () => ({
    status: 403,
    error: 'Free tier limited to 5 recommendations per month. Upgrade to get unlimited.',
  }),

  authenticationError: () => ({
    status: 401,
    error: 'No token provided',
  }),

  serverError: (message?: string) => ({
    status: 500,
    error: message || 'Failed to generate recommendation',
  }),
};
