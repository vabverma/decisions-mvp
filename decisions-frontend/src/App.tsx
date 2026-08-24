import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PricingRecommendation from './pages/PricingRecommendation';
import Integrations from './pages/Integrations';
import Pricing from './pages/Pricing';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route path="/register" element={<Register onRegister={setToken} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-brand">⚡ DECISIONS</div>
          <ul className="nav-links">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/pricing">Get Recommendation</a></li>
            <li><a href="/integrations">Integrations</a></li>
            <li><a href="/plans">Upgrade</a></li>
            <li><a href="#" onClick={() => { setToken(null); }}>Logout</a></li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<Dashboard token={token} />} />
        <Route path="/pricing" element={<PricingRecommendation token={token} />} />
        <Route path="/integrations" element={<Integrations token={token} />} />
        <Route path="/plans" element={<Pricing token={token} />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}
