import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccess = Boolean((location.state as { resetSuccess?: boolean } | null)?.resetSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      onLogin(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1>Sign In</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Welcome to DECISIONS</p>

        {resetSuccess && <div className="success">Your password has been reset. Sign in with your new password.</div>}
        {error && <div className="error">{error}</div>}

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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          <a href="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>Forgot password?</a>
        </p>
        <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
