import Anthropic from '@anthropic-ai/sdk';

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
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const recommendation = JSON.parse(jsonMatch[0]) as PricingRecommendation;
    return recommendation;
  } catch (error) {
    console.error('Failed to parse Claude response:', responseText);
    throw new Error('Failed to generate pricing recommendation');
  }
}
