import { useState } from 'react';
import axios from 'axios';

interface PricingRecommendationProps {
  token: string;
}

interface Recommendation {
  id: string;
  recommendedPrice: number;
  reasoning: string;
  projectedMargin: number;
  projectedMonthlyRevenue: number;
  priceChange: number;
  projectedVolumeChange: number;
  annualImpact: number;
}

export default function PricingRecommendation({ token }: PricingRecommendationProps) {
  const [productName, setProductName] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [cost, setCost] = useState('');
  const [competitorPrice, setCompetitorPrice] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [demandTrend, setDemandTrend] = useState<'high' | 'stable' | 'low'>('stable');
  const [customerFeedback, setCustomerFeedback] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await axios.post(
        '/api/decisions/pricing',
        {
          productName,
          currentPrice: parseFloat(currentPrice),
          cost: parseFloat(cost),
          competitorPrice: parseFloat(competitorPrice),
          monthlyVolume: parseInt(monthlyVolume),
          demandTrend,
          customerFeedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRecommendation(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to get recommendation';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Get Pricing Recommendation</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Let AI analyze your product pricing and recommend optimizations
      </p>

      <div style={{ maxWidth: '600px' }}>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="card">
          <h3>Product Information</h3>

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Current Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Competitor Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Monthly Volume (units) *</label>
              <input
                type="number"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Demand Trend *</label>
            <select value={demandTrend} onChange={(e) => setDemandTrend(e.target.value as any)}>
              <option value="high">High (increasing demand)</option>
              <option value="stable">Stable (consistent demand)</option>
              <option value="low">Low (decreasing demand)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Customer Feedback (optional)</label>
            <textarea
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder="e.g., 'Customers say it's too expensive' or 'High demand, want to raise price'"
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner"></span> : '✨ Get Recommendation'}
          </button>
        </form>

        {recommendation && (
          <div className="card" style={{ background: '#f0f9ff', borderLeft: '4px solid #007bff' }}>
            <h3>AI Recommendation</h3>

            <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px' }}>
              <p style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>Recommended Price</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#007bff' }}>
                ${recommendation.recommendedPrice.toFixed(2)}
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {recommendation.priceChange > 0 ? '📈' : '📉'} {Math.abs(recommendation.priceChange).toFixed(1)}% from current price
              </p>
            </div>

            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: '#333' }}>
              <strong>Strategy:</strong> {recommendation.reasoning}
            </p>

            <div className="grid" style={{ marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'white', borderRadius: '6px' }}>
                <p style={{ color: '#666', fontSize: '12px' }}>Projected Margin</p>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>{recommendation.projectedMargin.toFixed(1)}%</p>
              </div>

              <div style={{ padding: '12px', background: 'white', borderRadius: '6px' }}>
                <p style={{ color: '#666', fontSize: '12px' }}>Monthly Revenue</p>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>
                  ${recommendation.projectedMonthlyRevenue.toLocaleString()}
                </p>
              </div>

              <div style={{ padding: '12px', background: 'white', borderRadius: '6px' }}>
                <p style={{ color: '#666', fontSize: '12px' }}>Volume Change</p>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>
                  {recommendation.projectedVolumeChange > 0 ? '+' : ''}{recommendation.projectedVolumeChange.toFixed(1)}%
                </p>
              </div>

              <div style={{ padding: '12px', background: 'white', borderRadius: '6px' }}>
                <p style={{ color: '#666', fontSize: '12px' }}>Annual Impact</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#28a745' }}>
                  +${recommendation.annualImpact.toLocaleString()}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
              💡 Implement this price change and track results in your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
