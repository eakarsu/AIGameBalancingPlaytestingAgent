import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api';

const descriptions = {
  playtest_sessions: 'Automated AI playtesting sessions',
  difficulty_curves: 'AI-powered difficulty analysis',
  economy_settings: 'In-game economy tuning & analysis',
  exploit_reports: 'AI exploit & vulnerability detection',
  progression_models: 'Player progression path modeling',
  balance_recommendations: 'AI-generated balance suggestions',
  meta_analyses: 'Game meta & strategy analysis',
  sentiment_analyses: 'Player feedback sentiment analysis',
  game_configurations: 'Game parameter management',
  player_profiles: 'Test player profile management',
  test_scenarios: 'Playtesting scenario definitions',
  balance_rules: 'Automated balancing rules',
  game_items: 'Game item & asset management',
  analytics_metrics: 'Key performance metrics tracking',
  session_history: 'Past playtesting session logs',
  reports: 'Generated analysis reports',
};

const icons = {
  playtest_sessions: '🎮',
  difficulty_curves: '📈',
  economy_settings: '💰',
  exploit_reports: '🛡️',
  progression_models: '🚀',
  balance_recommendations: '⚖️',
  meta_analyses: '🧠',
  sentiment_analyses: '💬',
  game_configurations: '⚙️',
  player_profiles: '👤',
  test_scenarios: '🧪',
  balance_rules: '📏',
  game_items: '🗡️',
  analytics_metrics: '📊',
  session_history: '📋',
  reports: '📝',
};

const pathMap = {
  playtest_sessions: '/playtests',
  difficulty_curves: '/difficulty',
  economy_settings: '/economy',
  exploit_reports: '/exploits',
  progression_models: '/progression',
  balance_recommendations: '/balance',
  meta_analyses: '/meta',
  sentiment_analyses: '/sentiment',
  game_configurations: '/configurations',
  player_profiles: '/player-profiles',
  test_scenarios: '/scenarios',
  balance_rules: '/balance-rules',
  game_items: '/game-items',
  analytics_metrics: '/analytics',
  session_history: '/sessions',
  reports: '/reports',
};

const aiTables = [
  'playtest_sessions', 'difficulty_curves', 'economy_settings', 'exploit_reports',
  'progression_models', 'balance_recommendations', 'meta_analyses', 'sentiment_analyses',
];

export default function Dashboard({ features }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet('/dashboard/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const aiStats = stats.filter((s) => aiTables.includes(s.name));
  const nonAiStats = stats.filter((s) => !aiTables.includes(s.name));

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div className="ai-loading">
          <div className="spinner" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">AI Game Balancing & Playtesting Platform Overview</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, color: 'var(--primary-light)', marginBottom: 16, textAlign: 'left' }}>
        AI-Powered Features
      </h2>
      <div className="dashboard-grid">
        {aiStats.map((s) => (
          <div key={s.name} className="dash-card" onClick={() => navigate(pathMap[s.name])}>
            <div className="ai-badge">AI Powered</div>
            <div className="card-icon">{icons[s.name]}</div>
            <h3>{s.label}</h3>
            <div className="card-count">{s.count}</div>
            <div className="card-desc">{descriptions[s.name]}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 32, textAlign: 'left' }}>
        Management Features
      </h2>
      <div className="dashboard-grid">
        {nonAiStats.map((s) => (
          <div key={s.name} className="dash-card" onClick={() => navigate(pathMap[s.name])}>
            <div className="card-icon">{icons[s.name]}</div>
            <h3>{s.label}</h3>
            <div className="card-count">{s.count}</div>
            <div className="card-desc">{descriptions[s.name]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
