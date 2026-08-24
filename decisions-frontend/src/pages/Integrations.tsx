import { useState } from 'react';
import api from '../api';

interface IntegrationsProps {
  token: string;
}

export default function Integrations({ token }: IntegrationsProps) {
  const [shopifyUrl, setShopifyUrl] = useState('');
  const [shopifyToken, setShopifyToken] = useState('');
  const [n8nWebhook, setN8nWebhook] = useState('');
  const [plausibleSiteId, setPlausibleSiteId] = useState('');
  const [plausibleApiKey, setPlausibleApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const connectShopify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post(
        '/integrations/shopify/connect',
        { storeUrl: shopifyUrl, accessToken: shopifyToken }
      );
      setMessage('✅ Shopify connected successfully!');
      setShopifyUrl('');
      setShopifyToken('');
    } catch (err) {
      setError('Failed to connect Shopify. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const connectN8n = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post(
        '/integrations/n8n/connect',
        { webhookUrl: n8nWebhook }
      );
      setMessage('✅ n8n webhook connected successfully!');
      setN8nWebhook('');
    } catch (err) {
      setError('Failed to connect n8n. Check the webhook URL.');
    } finally {
      setLoading(false);
    }
  };

  const connectPlausible = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post(
        '/integrations/plausible/connect',
        { siteId: plausibleSiteId, apiKey: plausibleApiKey }
      );
      setMessage('✅ Plausible connected successfully!');
      setPlausibleSiteId('');
      setPlausibleApiKey('');
    } catch (err) {
      setError('Failed to connect Plausible. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Integrations</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Connect your tools to automate pricing updates and track revenue impact
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Shopify */}
        <div className="card">
          <h3>🛍️ Shopify</h3>
          <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
            Connect your Shopify store to automatically fetch products and apply pricing recommendations.
          </p>

          <form onSubmit={connectShopify}>
            <div className="form-group">
              <label>Store URL (e.g., mystore.myshopify.com)</label>
              <input
                type="text"
                value={shopifyUrl}
                onChange={(e) => setShopifyUrl(e.target.value)}
                placeholder="mystore.myshopify.com"
              />
            </div>

            <div className="form-group">
              <label>Access Token</label>
              <input
                type="password"
                value={shopifyToken}
                onChange={(e) => setShopifyToken(e.target.value)}
                placeholder="shpat_..."
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner"></span> : 'Connect Shopify'}
            </button>
          </form>
        </div>

        {/* n8n */}
        <div className="card">
          <h3>⚙️ n8n Automation</h3>
          <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
            Connect a webhook to automatically execute pricing changes across your platform.
          </p>

          <form onSubmit={connectN8n}>
            <div className="form-group">
              <label>n8n Webhook URL</label>
              <input
                type="url"
                value={n8nWebhook}
                onChange={(e) => setN8nWebhook(e.target.value)}
                placeholder="https://n8n.example.com/webhook/pricing"
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner"></span> : 'Connect n8n'}
            </button>
          </form>
        </div>

        {/* Plausible */}
        <div className="card">
          <h3>📊 Plausible Analytics</h3>
          <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
            Track revenue impact by monitoring site analytics after price changes.
          </p>

          <form onSubmit={connectPlausible}>
            <div className="form-group">
              <label>Site ID</label>
              <input
                type="text"
                value={plausibleSiteId}
                onChange={(e) => setPlausibleSiteId(e.target.value)}
                placeholder="example.com"
              />
            </div>

            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={plausibleApiKey}
                onChange={(e) => setPlausibleApiKey(e.target.value)}
                placeholder="sk_..."
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner"></span> : 'Connect Plausible'}
            </button>
          </form>
        </div>

        {/* Twenty CRM */}
        <div className="card">
          <h3>👥 Twenty CRM</h3>
          <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
            Sync customer segments to personalize pricing by customer tier.
          </p>

          <p style={{ padding: '12px', background: '#f0f0f0', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
            Coming in Phase 2 ✨
          </p>
        </div>
      </div>
    </div>
  );
}
