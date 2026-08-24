import { useState, useEffect } from 'react';
import axios from 'axios';

interface PricingProps {
  token: string;
}

export default function Pricing({ token }: PricingProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get('/api/billing/subscription', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscription(response.data);
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      }
    };
    fetchSubscription();
  }, [token]);

  const handleCheckout = async (planType: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/billing/create-checkout',
        { planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Choose Your Plan</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Start free, upgrade when you're ready
      </p>

      {error && <div className="error">{error}</div>}

      {subscription?.tier && (
        <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '6px', marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', color: '#1976d2', margin: 0 }}>
            Current plan: <strong>{subscription.tier}</strong>
            {subscription.subscription?.nextBillingDate && (
              <>
                {' '}— Next billing:{' '}
                {new Date(subscription.subscription.nextBillingDate).toLocaleDateString()}
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid" style={{ marginBottom: '32px' }}>
        {/* Free Tier */}
        <div
          className="card"
          style={{
            border:
              subscription?.tier === 'free'
                ? '2px solid #007bff'
                : '1px solid #e5e5e5',
            position: 'relative',
          }}
        >
          {subscription?.tier === 'free' && (
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                background: '#007bff',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              CURRENT
            </div>
          )}
          <h3>Free</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: '16px 0' }}>$0</p>
          <ul style={{ marginBottom: '24px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
            <li>✅ 5 recommendations/month</li>
            <li>✅ Basic dashboard</li>
            <li>❌ Revenue tracking</li>
            <li>❌ Integrations</li>
          </ul>
          <button disabled style={{ width: '100%', opacity: 0.5 }}>
            You're on this plan
          </button>
        </div>

        {/* Pricing Optimizer */}
        <div
          className="card"
          style={{
            border:
              subscription?.tier === 'pricing_optimizer'
                ? '2px solid #28a745'
                : '1px solid #e5e5e5',
            position: 'relative',
          }}
        >
          {subscription?.tier === 'pricing_optimizer' && (
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                background: '#28a745',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              CURRENT
            </div>
          )}
          <h3>Pricing Optimizer</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: '16px 0' }}>
            $99 <span style={{ fontSize: '16px', color: '#666' }}>/month</span>
          </p>
          <p style={{ fontSize: '13px', color: '#28a745', marginBottom: '12px' }}>
            Most popular
          </p>
          <ul style={{ marginBottom: '24px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
            <li>✅ Unlimited recommendations</li>
            <li>✅ Revenue tracking</li>
            <li>✅ Integration support</li>
            <li>✅ Email support</li>
          </ul>
          <button
            onClick={() => handleCheckout('pricing_optimizer')}
            disabled={loading || subscription?.tier === 'pricing_optimizer'}
            style={{ width: '100%' }}
          >
            {loading ? <span className="spinner"></span> : 'Get Started'}
          </button>
        </div>

        {/* Premium */}
        <div
          className="card"
          style={{
            border:
              subscription?.tier === 'premium' ? '2px solid #ffc107' : '1px solid #e5e5e5',
            position: 'relative',
          }}
        >
          {subscription?.tier === 'premium' && (
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                background: '#ffc107',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              CURRENT
            </div>
          )}
          <h3>Premium</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: '16px 0' }}>
            $299 <span style={{ fontSize: '16px', color: '#666' }}>/month</span>
          </p>
          <p style={{ fontSize: '13px', color: '#ffc107', marginBottom: '12px' }}>
            Best value
          </p>
          <ul style={{ marginBottom: '24px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
            <li>✅ Everything in Pricing Optimizer</li>
            <li>✅ Inventory forecasting</li>
            <li>✅ Hiring predictions</li>
            <li>✅ Weekly strategy calls</li>
          </ul>
          <button
            onClick={() => handleCheckout('premium')}
            disabled={loading || subscription?.tier === 'premium'}
            style={{ width: '100%' }}
          >
            {loading ? <span className="spinner"></span> : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h3>Frequently Asked Questions</h3>

        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>Can I cancel anytime?</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Yes! Cancel your subscription anytime. No questions asked.
          </p>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>Is there a free trial?</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Yes! Start with our Free tier and get 5 recommendations per month to test it out.
          </p>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>What payment methods do you accept?</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            We accept all major credit cards via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
