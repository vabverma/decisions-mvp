import express, { Request, Response } from 'express';
import { pool } from '../db/init';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Get user's dashboard metrics
router.get('/dashboard', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    // Get recommendation stats
    const recStats = await pool.query(
      `SELECT
        COUNT(*) as total_recommendations,
        COUNT(CASE WHEN status = 'implemented' THEN 1 END) as implemented,
        AVG(annual_impact) as avg_annual_impact,
        SUM(annual_impact) as total_impact
       FROM recommendations
       WHERE user_id = $1`,
      [userId]
    );

    // Get recent recommendations
    const recent = await pool.query(
      `SELECT r.id, p.id as product_id, p.product_name, r.recommended_price, r.annual_impact,
              r.created_at, r.status, p.shopify_variant_id, p.shopify_product_title
       FROM recommendations r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get subscription info
    const userResult = await pool.query(
      `SELECT subscription_tier FROM users WHERE id = $1`,
      [userId]
    );

    const shopifyResult = await pool.query(
      `SELECT 1 FROM integrations WHERE user_id = $1 AND integration_type = 'shopify' AND status = 'connected' LIMIT 1`,
      [userId]
    );

    // pg returns NUMERIC/aggregate columns as strings; coerce to numbers so
    // the frontend can safely call .toFixed()/.toLocaleString() on them.
    const rawStats = recStats.rows[0];
    const stats = {
      total_recommendations: Number(rawStats.total_recommendations) || 0,
      implemented: Number(rawStats.implemented) || 0,
      avg_annual_impact: Number(rawStats.avg_annual_impact) || 0,
      total_impact: Number(rawStats.total_impact) || 0,
    };
    const recentRecommendations = recent.rows.map((row) => ({
      ...row,
      recommended_price: Number(row.recommended_price),
      annual_impact: Number(row.annual_impact),
    }));

    res.json({
      stats,
      recentRecommendations,
      subscriptionTier: userResult.rows[0]?.subscription_tier,
      shopifyConnected: shopifyResult.rows.length > 0,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track revenue from recommendation
router.post('/track', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { recommendationId, actualPrice, actualVolume, actualRevenue } = req.body;

  try {
    if (!recommendationId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.query(
      `INSERT INTO revenue_tracking (user_id, recommendation_id, actual_price, actual_volume, actual_revenue)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, recommendationId, actualPrice, actualVolume, actualRevenue]
    );

    // Update recommendation status - only if it belongs to the user
    const result = await pool.query(
      `UPDATE recommendations SET status = 'tracking'
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [recommendationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json({ status: 'tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track revenue' });
  }
});

export default router;
