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

export async function getPricingRecommendation(
  input: PricingInput
): Promise<PricingRecommendation> {
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

  let message;
  try {
    message = await getClient().messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
  } catch (error: any) {
    console.error('Anthropic API call failed:', { status: error?.status, name: error?.name, message: error?.message });
    throw new Error('Pricing recommendation service is temporarily unavailable');
  }

  // Content can include a leading "thinking" block before the "text" block,
  // so find the text block rather than assuming it's content[0].
  const textBlock = message.content.find((block) => block.type === 'text');
  const responseText = textBlock && textBlock.type === 'text' ? textBlock.text : '';

  let parsed: Omit<PricingRecommendation, 'projectedMargin'>;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    parsed = pricingRecommendationSchema.omit({ projectedMargin: true }).parse(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Failed to parse Claude response:', responseText, error);
    throw new Error('Failed to generate pricing recommendation');
  }

  // Margin is deterministic arithmetic from numbers we already have -- compute
  // it ourselves rather than trusting the model to do the division correctly.
  const projectedMargin = Math.round(((parsed.recommendedPrice - input.cost) / parsed.recommendedPrice) * 1000) / 10;

  return { ...parsed, projectedMargin };
}
