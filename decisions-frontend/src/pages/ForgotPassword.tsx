import { useState } from 'react';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1>Reset Password</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner"></span> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Back to Sign In</a>
        </p>
      </div>
    </div>
  );
}
