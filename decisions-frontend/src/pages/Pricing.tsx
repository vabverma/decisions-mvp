import { useState } from 'react';
import axios from 'axios';

interface PricingProps {
  token: string;
}

export default function Pricing({ token }: PricingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      recommendations: 5,
      features: [
        '5 recommendations per month',
        'Basic pricing analysis',
        'Email support',
        'Access to dashboard',
      ],
      planType: null,
      cta: 'Current Plan',
    },
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      recommendations: 20,
      features: [
        '20 recommendations per month',
        'Advanced market analysis',
        'Priority email support',
        'Usage analytics',
        'API access',
      ],
      planType: 'starter',
      cta: 'Subscribe Now',
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      recommendations: 100,
      features: [
        '100 recommendations per month',
        'Unlimited market analysis',
        '24/7 priority support',
        'Advanced analytics & reporting',
        'API access',
        'Custom integrations',
      ],
      planType: 'pro',
      cta: 'Subscribe Now',
    },
  ];

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
      setError(err.response?.data?.error || 'Failed to create checkout session');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
          Choose the perfect plan for your business. Scale as you grow.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: '#fee',
            color: '#c33',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          marginBottom: '64px',
        }}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            style={{
              border: tier.highlight ? '2px solid #1976d2' : '1px solid #e5e5e5',
              borderRadius: '12px',
              padding: '32px',
              position: 'relative',
              backgroundColor: tier.highlight ? '#f5f9ff' : '#fff',
              transform: tier.highlight ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
          >
            {tier.highlight && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#1976d2',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                Most Popular
              </div>
            )}

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {tier.name}
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{tier.price}</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{tier.period}</span>
            </div>

            <div
              style={{
                background: '#f0f0f0',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {tier.recommendations} recommendations/month
            </div>

            <ul style={{ marginBottom: '32px', listStyle: 'none', padding: 0 }}>
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px',
                    color: '#333',
                  }}
                >
                  <span style={{ marginRight: '8px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {tier.planType ? (
              <button
                onClick={() => handleCheckout(tier.planType!)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: tier.highlight ? '#1976d2' : '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {loading ? 'Processing...' : tier.cta}
              </button>
            ) : (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: '#e5e5e5',
                  color: '#999',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'default',
                }}
              >
                {tier.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#f9f9f9',
          padding: '48px',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Questions? We're here to help.
        </h3>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          Contact us at support@decisions.ai or reach out through the chat.
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}
