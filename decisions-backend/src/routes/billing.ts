import express, { Request, Response } from 'express';
import { pool } from '../db/init';
import { getStripe } from '../services/stripe.service';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

const PRICING_OPTIMIZER_PRICE_ID = process.env.STRIPE_PRICING_OPTIMIZER_PRICE_ID || 'price_test_pricing';
const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || 'price_test_premium';

router.post('/create-checkout', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { planType } = req.body;

  if (!planType || !['pricing_optimizer', 'premium'].includes(planType)) {
    return res.status(400).json({ error: 'Invalid plan type' });
  }

  try {
    const userResult = await pool.query('SELECT stripe_customer_id, email FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const priceId = planType === 'premium' ? PREMIUM_PRICE_ID : PRICING_OPTIMIZER_PRICE_ID;

    const session = await getStripe().checkout.sessions.create({
      customer: user.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.DASHBOARD_URL}/dashboard?success=true`,
      cancel_url: `${process.env.DASHBOARD_URL}/pricing?cancelled=true`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/create-payment-method', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const userResult = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const setupIntent = await getStripe().setupIntents.create({
      customer: user.stripe_customer_id,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Setup intent error:', error);
    res.status(500).json({ error: 'Failed to create setup intent' });
  }
});

router.get('/subscription', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const userResult = await pool.query(
      'SELECT stripe_customer_id, subscription_tier FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    if (!user.stripe_customer_id) {
      return res.json({ tier: 'free', subscription: null });
    }

    const subscriptions = await getStripe().subscriptions.list({
      customer: user.stripe_customer_id,
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    res.json({
      tier: user.subscription_tier,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            nextBillingDate: new Date((subscription as any).current_period_end * 1000),
            planName: subscription.items.data[0]?.price.nickname,
          }
        : null,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
