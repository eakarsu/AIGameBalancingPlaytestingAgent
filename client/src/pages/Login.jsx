import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signInWith = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onLogin();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signInWith(email, password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <div className="icon">🎮</div>
          <h1>Game Balancing Agent</h1>
          <p>AI-Powered Game Testing & Balancing Platform</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const demoEmail = import.meta.env.VITE_DEMO_EMAIL || '';
              const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || '';
              setEmail(demoEmail);
              setPassword(demoPassword);
              signInWith(demoEmail, demoPassword);
            }}
            disabled={loading || !import.meta.env.VITE_DEMO_EMAIL || !import.meta.env.VITE_DEMO_PASSWORD}
            aria-label="Fill Demo Credentials"
            style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
          >
            Fill Demo Credentials
          </button>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
