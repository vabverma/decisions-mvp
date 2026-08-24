import Stripe from 'stripe';

let _stripe: Stripe;

export const getStripe = (): Stripe => {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    _stripe = new Stripe(apiKey);
  }
  return _stripe;
};
