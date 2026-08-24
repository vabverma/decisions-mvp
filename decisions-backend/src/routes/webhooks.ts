import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { pool } from '../db/init';
import { getStripe } from '../services/stripe.service';

const router = express.Router();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET || WEBHOOK_SECRET === 'whsec_test_secret') {
  console.error('🔴 CRITICAL: STRIPE_WEBHOOK_SECRET must be configured and not be the test default');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig || !WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Webhook not properly configured' });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  await processStripeEvent(event);
  res.json({ received: true });
});

async function processStripeEvent(event: Stripe.Event) {

  switch (event.type) {
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const planMap: Record<string, string> = {
        'pricing_optimizer': 'pricing_optimizer',
        'premium': 'premium',
      };

      const planId = (subscription.items.data[0]?.price.lookup_key || '');
      const tier = planMap[planId] || 'free';

      await pool.query(
        'UPDATE users SET subscription_tier = $1 WHERE stripe_customer_id = $2',
        [tier, customerId]
      );

      // Reset usage limit on tier change
      if (tier !== 'free') {
        await pool.query(
          'UPDATE usage_tracking SET recommendations_this_month = 0 WHERE user_id = (SELECT id FROM users WHERE stripe_customer_id = $1)',
          [customerId]
        );
      }

      console.log(`✅ Subscription updated: ${customerId} → ${tier}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await pool.query(
        'UPDATE users SET subscription_tier = $1 WHERE stripe_customer_id = $2',
        ['free', customerId]
      );

      console.log(`⚠️ Subscription cancelled: ${customerId}`);
      break;
    }

    case 'charge.succeeded': {
      const charge = event.data.object as Stripe.Charge;
      console.log(`💰 Payment successful: ${charge.id} ($${(charge.amount / 100).toFixed(2)})`);
      break;
    }

    case 'charge.failed': {
      const charge = event.data.object as Stripe.Charge;
      console.log(`❌ Payment failed: ${charge.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

export default router;
