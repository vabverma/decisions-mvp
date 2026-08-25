import { useState, useEffect } from 'react';
import api from '../api';

interface DashboardProps {
  token: string;
}

interface DashboardData {
  stats: {
    total_recommendations: number;
    implemented: number;
    avg_annual_impact: number;
    total_impact: number;
  };
  recentRecommendations: Array<{
    id: string;
    product_name: string;
    recommended_price: number;
    annual_impact: number;
    created_at: string;
    status: string;
  }>;
  subscriptionTier: string;
}

export default function Dashboard({ token }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [implementingId, setImplementingId] = useState<string | null>(null);

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
    try {
      await api.patch(`/decisions/${id}/implement`);
      await fetchDashboard();
    } catch (err) {
      setError('Failed to mark recommendation as implemented');
    } finally {
      setImplementingId(null);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  if (!data) return null;

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div style={{ marginBottom: '32px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', color: '#1976d2' }}>
          📊 Plan: <strong>{data.subscriptionTier}</strong>
          {data.subscriptionTier === 'free' && ' — 1 recommendation per month'}
        </p>
      </div>

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
          <p style={{ color: '#999' }}>No recommendations yet. <a href="/pricing">Get started →</a></p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Recommended Price</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Annual Impact</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Status</th>
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
                      <span style={{ color: '#28a745', fontSize: '14px', fontWeight: 500 }}>✓ Implemented</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
