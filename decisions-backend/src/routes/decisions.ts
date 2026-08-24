import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getPricingRecommendation } from '../services/claude.service';
import { pool } from '../db/init';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

const pricingInputSchema = z.object({
  productName: z.string().min(1).max(255),
  currentPrice: z.number().positive(),
  cost: z.number().nonnegative(),
  competitorPrice: z.number().positive(),
  monthlyVolume: z.number().positive().int(),
  demandTrend: z.enum(['high', 'stable', 'low']),
  customerFeedback: z.string().max(1000).optional(),
});

router.post('/pricing', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  let validated;
  try {
    validated = pricingInputSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input parameters' });
  }

  const { productName, currentPrice, cost, competitorPrice, monthlyVolume, demandTrend, customerFeedback } = validated;

  try {
    // Check tier-based limits
    const tierLimits: Record<string, number> = {
      free: 5,
      starter: 20,
      pro: 100,
    };

    const userResult = await pool.query(
      `SELECT subscription_tier FROM users WHERE id = $1`,
      [userId]
    );
    const user = userResult.rows[0];
    const tier = user.subscription_tier || 'free';
    const limit = tierLimits[tier] || tierLimits.free;

    const usageResult = await pool.query(
      `SELECT recommendations_this_month FROM usage_tracking WHERE user_id = $1`,
      [userId]
    );

    const usage = usageResult.rows[0];
    if (usage && usage.recommendations_this_month >= limit) {
      const tierName = tier === 'pro' ? 'Pro' : tier === 'starter' ? 'Starter' : 'Free';
      return res.status(429).json({
        error: `${tierName} tier limited to ${limit} recommendations per month. Upgrade to increase your limit.`
      });
    }

    // Get Claude recommendation
    const recommendation = await getPricingRecommendation({
      productName,
      currentPrice,
      cost,
      competitorPrice,
      monthlyVolume,
      demandTrend,
      customerFeedback,
    });

    // Store product
    const productResult = await pool.query(
      `INSERT INTO products (user_id, product_name, current_price, cost, competitor_price, monthly_volume, demand_trend, customer_feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, productName, currentPrice, cost, competitorPrice, monthlyVolume, demandTrend, customerFeedback]
    );

    const productId = productResult.rows[0].id;

    // Store recommendation
    const recResult = await pool.query(
      `INSERT INTO recommendations (user_id, product_id, recommended_price, reasoning, projected_margin, projected_monthly_revenue, price_change, projected_volume_change, annual_impact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [userId, productId, recommendation.recommendedPrice, recommendation.reasoning, recommendation.projectedMargin, recommendation.projectedMonthlyRevenue, recommendation.priceChange, recommendation.projectedVolumeChange, recommendation.annualImpact]
    );

    // Increment usage
    await pool.query(
      `UPDATE usage_tracking SET recommendations_this_month = recommendations_this_month + 1 WHERE user_id = $1`,
      [userId]
    );

    res.json({
      id: recResult.rows[0].id,
      productId,
      ...recommendation,
    });
  } catch (error: any) {
    // Log detailed error internally only
    console.error('Pricing recommendation error:', {
      message: error?.message,
      code: error?.code,
      userId,
    });

    // Return generic error to client
    res.status(500).json({ error: 'Failed to generate pricing recommendation' });
  }
});

export default router;
