import express, { Request, Response } from 'express';
import { getPricingRecommendation } from '../services/claude.service';
import { pool } from '../db/init';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/pricing', verifyToken, async (req: Request, res: Response) => {
  console.log('📍 Pricing recommendation route called');
  const userId = (req as any).user?.id;
  const { productName, currentPrice, cost, competitorPrice, monthlyVolume, demandTrend, customerFeedback } = req.body;
  console.log('User ID:', userId, 'Product:', productName);

  try {
    // Check freemium limit
    const userResult = await pool.query(
      `SELECT subscription_tier FROM users WHERE id = $1`,
      [userId]
    );
    const user = userResult.rows[0];

    if (user.subscription_tier === 'free') {
      const usageResult = await pool.query(
        `SELECT recommendations_this_month FROM usage_tracking WHERE user_id = $1`,
        [userId]
      );

      const usage = usageResult.rows[0];
      if (usage && usage.recommendations_this_month >= 5) {
        return res.status(403).json({ error: 'Free tier limited to 5 recommendations per month. Upgrade to get unlimited.' });
      }
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
    console.error('❌ Pricing recommendation error:', {
      message: error?.message || String(error),
      code: error?.code,
      status: error?.status,
      stack: error?.stack,
      fullError: error,
    });

    // Provide more specific error messages for debugging
    if (error?.message?.includes('ANTHROPIC_API_KEY')) {
      console.error('🔴 Claude API key not configured');
      res.status(500).json({ error: 'API configuration error: Claude API key missing' });
    } else if (error?.message?.includes('DATABASE_URL')) {
      console.error('🔴 Database not configured');
      res.status(500).json({ error: 'API configuration error: Database connection missing' });
    } else {
      res.status(500).json({ error: 'Failed to generate recommendation', details: error?.message });
    }
  }
});

export default router;
