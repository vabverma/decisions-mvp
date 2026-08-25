import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

let _client: Anthropic;

const getClient = (): Anthropic => {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
};

interface PricingInput {
  productName: string;
  currentPrice: number;
  cost: number;
  competitorPrice: number;
  monthlyVolume: number;
  demandTrend: 'high' | 'stable' | 'low';
  customerFeedback?: string;
}

interface PricingRecommendation {
  recommendedPrice: number;
  reasoning: string;
  projectedMargin: number;
  projectedMonthlyRevenue: number;
  priceChange: number;
  projectedVolumeChange: number;
  annualImpact: number;
}

// Claude's output is free-form text we regex a JSON object out of; validate
// its shape before it flows into typed Postgres columns.
const pricingRecommendationSchema = z.object({
  recommendedPrice: z.number(),
  reasoning: z.string(),
  projectedMargin: z.number(),
  projectedMonthlyRevenue: z.number(),
  priceChange: z.number(),
  projectedVolumeChange: z.number(),
  annualImpact: z.number(),
});

function generateMockRecommendation(input: PricingInput): PricingRecommendation {
  const baseMargin = ((input.currentPrice - input.cost) / input.currentPrice) * 100;
  const recommendedPrice = input.competitorPrice > input.currentPrice
    ? input.currentPrice * 1.15
    : input.currentPrice * 1.08;

  const margin = ((recommendedPrice - input.cost) / recommendedPrice) * 100;
  const volumeChange = input.demandTrend === 'high' ? -5 : (input.demandTrend === 'low' ? 15 : 0);
  const newVolume = input.monthlyVolume * (1 + volumeChange / 100);
  const priceChange = ((recommendedPrice - input.currentPrice) / input.currentPrice) * 100;

  const currentAnnualRevenue = input.currentPrice * input.monthlyVolume * 12;
  const projectedMonthlyRevenue = recommendedPrice * newVolume;
  const projectedAnnualRevenue = projectedMonthlyRevenue * 12;
  const annualImpact = projectedAnnualRevenue - currentAnnualRevenue;

  return {
    recommendedPrice: Math.round(recommendedPrice * 100) / 100,
    reasoning: `Based on market analysis, your product is positioned ${input.competitorPrice > input.currentPrice ? 'below' : 'near'} competitors. A ${priceChange > 0 ? 'modest increase' : 'slight decrease'} to $${(Math.round(recommendedPrice * 100) / 100).toFixed(2)} optimizes margin while accounting for ${input.demandTrend} demand. ${input.customerFeedback ? 'Customer feedback suggests ' + input.customerFeedback.toLowerCase() : ''}`,
    projectedMargin: Math.round(margin * 10) / 10,
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
    priceChange: Math.round(priceChange * 10) / 10,
    projectedVolumeChange: Math.round(volumeChange * 10) / 10,
    annualImpact: Math.round(annualImpact),
  };
}

export async function getPricingRecommendation(
  input: PricingInput
): Promise<PricingRecommendation> {
  const useRealAPI = process.env.USE_CLAUDE_API === 'true';

  if (!useRealAPI) {
    console.log('🧪 Using mock recommendation for:', input.productName);
    return generateMockRecommendation(input);
  }

  console.log('🤖 Getting pricing recommendation for:', input.productName);
  const prompt = `You are a pricing strategist for e-commerce businesses. Analyze the following product data and provide a specific price recommendation.

Product: ${input.productName}
Current Price: $${input.currentPrice}
Cost: $${input.cost}
Competitor Price: $${input.competitorPrice}
Monthly Sales Volume: ${input.monthlyVolume} units
Demand Trend: ${input.demandTrend}
${input.customerFeedback ? `Customer Feedback: ${input.customerFeedback}` : ''}

Provide your recommendation in this exact JSON format:
{
  "recommendedPrice": <number>,
  "reasoning": "<2-3 sentence explanation of the strategy>",
  "projectedMargin": <percentage>,
  "projectedMonthlyRevenue": <number>,
  "priceChange": <percentage>,
  "projectedVolumeChange": <percentage>,
  "annualImpact": <annual revenue change in dollars>
}

Consider:
1. Market positioning (vs competitors)
2. Demand elasticity (how volume changes with price)
3. Profit optimization (margin vs volume trade-off)
4. Customer feedback sentiment`;

  const message = await getClient().messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log('Claude raw response:', JSON.stringify({ stopReason: message.stop_reason, contentTypes: message.content.map(c => c.type), usage: message.usage }));

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    return pricingRecommendationSchema.parse(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Failed to parse Claude response:', responseText, error);
    throw new Error('Failed to generate pricing recommendation');
  }
}
