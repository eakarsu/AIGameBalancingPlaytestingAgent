import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getUser } from '../api';

export default function Layout({ features, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const aiFeatures = features.filter((f) => f.ai);
  const nonAiFeatures = features.filter((f) => !f.ai);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>
            <span style={{ fontSize: '20px' }}>🎮</span>
            <span>Game Balancer AI</span>
          </h2>
          <p>Playtesting & Balancing Platform</p>
        </div>

        <div className="sidebar-section">
          <button
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">AI Features</div>
          {aiFeatures.map((f) => (
            <button
              key={f.key}
              className={`sidebar-link ${location.pathname === f.path ? 'active' : ''}`}
              onClick={() => navigate(f.path)}
            >
              <span className="icon">{f.icon}</span>
              <span>{f.label}</span>
              <span className="badge">AI</span>
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Management</div>
          {nonAiFeatures.map((f) => (
            <button
              key={f.key}
              className={`sidebar-link ${location.pathname === f.path ? 'active' : ''}`}
              onClick={() => navigate(f.path)}
            >
              <span className="icon">{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
            <div className="user-details">
              <div className="name">{user?.name || 'User'}</div>
              <div className="role">{user?.role || 'admin'}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm btn-full" onClick={handleLogout} style={{ marginTop: 8 }}>
            Sign Out
          </button>
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}
