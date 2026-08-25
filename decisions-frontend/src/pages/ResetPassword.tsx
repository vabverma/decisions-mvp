import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '100px auto' }}>
          <h1>Invalid Link</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            This password reset link is missing its token. Please request a new one.
          </p>
          <a href="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>Request a new link</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1>Set New Password</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Choose a new password for your account.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner"></span> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
