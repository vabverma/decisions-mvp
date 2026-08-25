import { useState, useEffect } from 'react';
import api from '../api';

interface DashboardProps {
  token: string;
}

interface Recommendation {
  id: string;
  product_id: string;
  product_name: string;
  recommended_price: number;
  annual_impact: number;
  created_at: string;
  status: string;
  shopify_variant_id: string | null;
  shopify_product_title: string | null;
}

interface DashboardData {
  stats: {
    total_recommendations: number;
    implemented: number;
    avg_annual_impact: number;
    total_impact: number;
  };
  recentRecommendations: Recommendation[];
  subscriptionTier: string;
  shopifyConnected: boolean;
}

interface ShopifyVariantOption {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  price: string;
}

export default function Dashboard({ token }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [implementingId, setImplementingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [linkingProductId, setLinkingProductId] = useState<string | null>(null);
  const [shopifyVariants, setShopifyVariants] = useState<ShopifyVariantOption[] | null>(null);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleImplement = async (id: string) => {
    setImplementingId(id);
    setNotice('');
    try {
      const response = await api.patch(`/decisions/${id}/implement`);
      if (response.data.status === 'implemented' && response.data.pushedToShopify) {
        setNotice('✅ Marked implemented and pushed the new price to Shopify.');
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update recommendation status');
    } finally {
      setImplementingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this recommendation? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/decisions/${id}`);
      await fetchDashboard();
    } catch (err) {
      setError('Failed to delete recommendation');
    } finally {
      setDeletingId(null);
    }
  };

  const startLinking = async (productId: string) => {
    setLinkingProductId(productId);
    setSelectedVariantId('');
    setShopifyVariants(null);
    setVariantsLoading(true);
    try {
      const response = await api.get('/integrations/shopify/products');
      setShopifyVariants(response.data.variants);
    } catch (err) {
      setError('Failed to load Shopify products');
      setLinkingProductId(null);
    } finally {
      setVariantsLoading(false);
    }
  };

  const saveLink = async (productId: string) => {
    const variant = shopifyVariants?.find((v) => v.variantId === selectedVariantId);
    if (!variant) return;

    setSavingLink(true);
    try {
      await api.post(`/decisions/${productId}/link-shopify`, {
        variantId: variant.variantId,
        productTitle: variant.productTitle,
      });
      setLinkingProductId(null);
      await fetchDashboard();
    } catch (err) {
      setError('Failed to link Shopify product');
    } finally {
      setSavingLink(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  if (!data) return null;

  const hasRecommendations = data.stats.total_recommendations > 0;

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <a href="/pricing" className="cta-banner" style={{ textDecoration: 'none' }}>
        <div>
          <div className="cta-banner-eyebrow">AI Pricing Engine</div>
          <div className="cta-banner-title">
            {hasRecommendations ? 'Ready for your next pricing win?' : 'Get your first pricing recommendation'}
          </div>
          <div className="cta-banner-subtitle">
            {hasRecommendations
              ? 'Analyze another product and see the projected impact in seconds.'
              : 'Answer a few questions about a product and let AI find your optimal price.'}
          </div>
        </div>
        <span className="cta-banner-button">✨ Get Recommendation</span>
      </a>

      <div style={{ marginBottom: '32px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', color: '#1976d2' }}>
          📊 Plan: <strong>{data.subscriptionTier}</strong>
          {data.subscriptionTier === 'free' && ' — 1 recommendation per month'}
        </p>
      </div>

      {notice && <div className="success">{notice}</div>}

      <div className="grid">
        <div className="card">
          <div className="stat">
            <div className="stat-value">{data.stats.total_recommendations}</div>
            <div className="stat-label">Total Recommendations</div>
          </div>
        </div>

        <div className="card">
          <div className="stat">
            <div className="stat-value">{data.stats.implemented}</div>
            <div className="stat-label">Implemented</div>
          </div>
        </div>

        <div className="card">
          <div className="stat">
            <div className="stat-value">${data.stats.total_impact?.toLocaleString() || '0'}</div>
            <div className="stat-label">Total Annual Impact</div>
          </div>
        </div>

        <div className="card">
          <div className="stat">
            <div className="stat-value">${data.stats.avg_annual_impact?.toLocaleString() || '0'}</div>
            <div className="stat-label">Avg per Recommendation</div>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '32px' }}>Recent Recommendations</h2>

      <div className="card">
        {data.recentRecommendations.length === 0 ? (
          <p style={{ color: '#999' }}>No recommendations yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Recommended Price</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Annual Impact</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Status</th>
                {data.shopifyConnected && <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Shopify</th>}
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.recentRecommendations.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{rec.product_name}</td>
                  <td style={{ padding: '12px' }}>${rec.recommended_price ? Number(rec.recommended_price).toFixed(2) : 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#28a745', fontWeight: 500 }}>
                    ${rec.annual_impact ? Number(rec.annual_impact).toLocaleString() : '0'}
                  </td>
                  <td style={{ padding: '12px', color: '#999', fontSize: '14px' }}>
                    {new Date(rec.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {rec.status === 'implemented' ? (
                      <button
                        onClick={() => handleImplement(rec.id)}
                        disabled={implementingId === rec.id}
                        title="Click to undo"
                        style={{ fontSize: '13px', padding: '6px 12px', background: 'none', border: 'none', color: '#28a745', fontWeight: 500, cursor: 'pointer' }}
                      >
                        {implementingId === rec.id ? '...' : '✓ Implemented'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleImplement(rec.id)}
                        disabled={implementingId === rec.id}
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                      >
                        {implementingId === rec.id ? '...' : 'Mark Implemented'}
                      </button>
                    )}
                  </td>
                  {data.shopifyConnected && (
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {rec.shopify_variant_id ? (
                        <span style={{ color: '#666' }} title={rec.shopify_product_title || ''}>
                          🛍️ Linked
                        </span>
                      ) : linkingProductId === rec.product_id ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {variantsLoading ? (
                            <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                          ) : (
                            <>
                              <select
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                style={{ width: '160px', padding: '4px', fontSize: '12px', marginBottom: 0 }}
                              >
                                <option value="">Select product…</option>
                                {shopifyVariants?.map((v) => (
                                  <option key={v.variantId} value={v.variantId}>
                                    {v.productTitle}{v.variantTitle !== 'Default Title' ? ` (${v.variantTitle})` : ''} — ${v.price}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => saveLink(rec.product_id)}
                                disabled={!selectedVariantId || savingLink}
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                              >
                                {savingLink ? '...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setLinkingProductId(null)}
                                style={{ fontSize: '12px', padding: '4px 8px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => startLinking(rec.product_id)}
                          style={{ fontSize: '12px', padding: '4px 8px', background: 'none', border: '1px solid #e5e5e5', color: '#666' }}
                        >
                          Link to Shopify
                        </button>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      disabled={deletingId === rec.id}
                      style={{ fontSize: '13px', padding: '6px 12px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                    >
                      {deletingId === rec.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
