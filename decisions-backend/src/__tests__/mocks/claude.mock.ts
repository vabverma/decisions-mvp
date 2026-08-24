/**
 * Claude API Mock
 * Provides mock implementations of Anthropic SDK for testing
 */

import { PricingRecommendation } from '../../services/claude.service';

export const mockClaudeResponse = (
  override?: Partial<PricingRecommendation>
): PricingRecommendation => ({
  recommendedPrice: 99.99,
  reasoning: 'Based on competitor pricing and market demand analysis, this price optimizes margin while maintaining volume.',
  projectedMargin: 45,
  projectedMonthlyRevenue: 4999.5,
  priceChange: 10,
  projectedVolumeChange: -5,
  annualImpact: 3000,
  ...override,
});

export const mockClaudeClient = () => ({
  messages: {
    create: jest.fn().mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockClaudeResponse()),
        },
      ],
    }),
  },
});

export const mockClaudeClientWithError = () => ({
  messages: {
    create: jest.fn().mockRejectedValue(
      new Error('ANTHROPIC_API_KEY not configured')
    ),
  },
});

export const mockClaudeClientInvalidJSON = () => ({
  messages: {
    create: jest.fn().mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'This is not valid JSON',
        },
      ],
    }),
  },
});

/**
 * Mocks for testing Claude response parsing
 */
export const testCases = {
  validResponse: {
    recommendedPrice: 79.99,
    reasoning: 'Price competitively to capture market share.',
    projectedMargin: 50,
    projectedMonthlyRevenue: 3999.5,
    priceChange: -20,
    projectedVolumeChange: 15,
    annualImpact: 5000,
  },
  edgeCaseZeroMargin: {
    recommendedPrice: 50.0,
    reasoning: 'Break-even pricing strategy.',
    projectedMargin: 0,
    projectedMonthlyRevenue: 2500.0,
    priceChange: 0,
    projectedVolumeChange: 0,
    annualImpact: 0,
  },
  edgeCaseNegativeChange: {
    recommendedPrice: 150.0,
    reasoning: 'Premium positioning for luxury segment.',
    projectedMargin: 75,
    projectedMonthlyRevenue: 3750.0,
    priceChange: 50,
    projectedVolumeChange: -50,
    annualImpact: -30000,
  },
};
