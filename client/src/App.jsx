import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './api';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

const features = [
  // AI Features
  { key: 'playtests', path: '/playtests', label: 'AI Playtesting', icon: '🎮', api: '/playtests', ai: true, aiEndpoint: '/ai/playtest-analyze',
    columns: ['name','game_title','ai_player_count','status','difficulty','duration_minutes','avg_completion_rate','avg_score'],
    fields: [
      { key: 'name', label: 'Session Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'ai_player_count', label: 'AI Player Count', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','running','completed','failed'] },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy','medium','hard','extreme'] },
      { key: 'duration_minutes', label: 'Duration (min)', type: 'number' },
      { key: 'avg_completion_rate', label: 'Avg Completion %', type: 'number' },
      { key: 'avg_score', label: 'Avg Score', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'difficulty', path: '/difficulty', label: 'Difficulty Curves', icon: '📈', api: '/difficulty', ai: true, aiEndpoint: '/ai/difficulty-analyze',
    columns: ['name','game_title','level_range','curve_type','min_difficulty','max_difficulty','smoothness_score','player_churn_rate','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'level_range', label: 'Level Range', type: 'text' },
      { key: 'curve_type', label: 'Curve Type', type: 'select', options: ['linear','exponential','logarithmic','sigmoid','stepwise','polynomial','flat'] },
      { key: 'min_difficulty', label: 'Min Difficulty', type: 'number' },
      { key: 'max_difficulty', label: 'Max Difficulty', type: 'number' },
      { key: 'spike_threshold', label: 'Spike Threshold', type: 'number' },
      { key: 'smoothness_score', label: 'Smoothness Score', type: 'number' },
      { key: 'player_churn_rate', label: 'Player Churn %', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','warning','critical'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'economy', path: '/economy', label: 'Economy Tuning', icon: '💰', api: '/economy', ai: true, aiEndpoint: '/ai/economy-analyze',
    columns: ['name','game_title','currency_name','daily_earn_rate','daily_spend_rate','inflation_rate','health_score','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'currency_name', label: 'Currency Name', type: 'text' },
      { key: 'daily_earn_rate', label: 'Daily Earn Rate', type: 'number' },
      { key: 'daily_spend_rate', label: 'Daily Spend Rate', type: 'number' },
      { key: 'inflation_rate', label: 'Inflation Rate %', type: 'number' },
      { key: 'sink_ratio', label: 'Sink Ratio', type: 'number' },
      { key: 'source_ratio', label: 'Source Ratio', type: 'number' },
      { key: 'health_score', label: 'Health Score', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','warning','critical'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'exploits', path: '/exploits', label: 'Exploit Detection', icon: '🛡️', api: '/exploits', ai: true, aiEndpoint: '/ai/exploit-detect',
    columns: ['name','game_title','exploit_type','severity','affected_system','status','detected_by'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'exploit_type', label: 'Exploit Type', type: 'select', options: ['duplication','movement','resource','progression','combat','automation','matchmaking','economy','rendering','security','payment'] },
      { key: 'severity', label: 'Severity (1-10)', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'affected_system', label: 'Affected System', type: 'text' },
      { key: 'reproduction_steps', label: 'Reproduction Steps', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['open','investigating','patched','critical'] },
      { key: 'mitigation', label: 'Mitigation', type: 'textarea' },
      { key: 'detected_by', label: 'Detected By', type: 'select', options: ['AI','Player Report','Manual'] },
    ]},
  { key: 'progression', path: '/progression', label: 'Progression Modeling', icon: '🚀', api: '/progression', ai: true, aiEndpoint: '/ai/progression-analyze',
    columns: ['name','game_title','model_type','player_archetype','avg_time_to_max','engagement_score','retention_rate','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'model_type', label: 'Model Type', type: 'select', options: ['time-based','skill-based','social','content-based','monetization','catch-up','tutorial'] },
      { key: 'player_archetype', label: 'Player Archetype', type: 'text' },
      { key: 'avg_time_to_max', label: 'Avg Time to Max (hrs)', type: 'number' },
      { key: 'bottleneck_level', label: 'Bottleneck Level', type: 'number' },
      { key: 'engagement_score', label: 'Engagement Score', type: 'number' },
      { key: 'retention_rate', label: 'Retention Rate %', type: 'number' },
      { key: 'monetization_impact', label: 'Monetization Impact', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','warning','critical'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'balance', path: '/balance', label: 'Balance Recommendations', icon: '⚖️', api: '/balance', ai: true, aiEndpoint: '/ai/balance-recommend',
    columns: ['name','game_title','target_element','change_type','current_value','recommended_value','impact_score','priority','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'target_element', label: 'Target Element', type: 'text' },
      { key: 'change_type', label: 'Change Type', type: 'select', options: ['buff','nerf','adjustment'] },
      { key: 'current_value', label: 'Current Value', type: 'number' },
      { key: 'recommended_value', label: 'Recommended Value', type: 'number' },
      { key: 'impact_score', label: 'Impact Score', type: 'number' },
      { key: 'confidence', label: 'Confidence %', type: 'number' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','approved','rejected'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'meta', path: '/meta', label: 'Meta Analysis', icon: '🧠', api: '/meta', ai: true, aiEndpoint: '/ai/meta-analyze',
    columns: ['name','game_title','analysis_type','dominant_strategy','meta_diversity_score','top_pick_rate','staleness_index','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'analysis_type', label: 'Analysis Type', type: 'select', options: ['seasonal','patch','tier-list','class-balance','strategy','efficiency','build','loadout','synergy','economy','progression','trend'] },
      { key: 'dominant_strategy', label: 'Dominant Strategy', type: 'text' },
      { key: 'meta_diversity_score', label: 'Meta Diversity Score', type: 'number' },
      { key: 'top_pick_rate', label: 'Top Pick Rate %', type: 'number' },
      { key: 'counter_play_score', label: 'Counter Play Score', type: 'number' },
      { key: 'staleness_index', label: 'Staleness Index', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','warning','critical'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'sentiment', path: '/sentiment', label: 'Sentiment Analysis', icon: '💬', api: '/sentiment', ai: true, aiEndpoint: '/ai/sentiment-analyze',
    columns: ['name','game_title','source','sentiment_score','positive_pct','negative_pct','top_theme','sample_size','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'source', label: 'Source', type: 'select', options: ['Steam Reviews','Reddit','Discord','App Store','Twitter','YouTube','Official Forum','Twitch','Support','Survey'] },
      { key: 'sentiment_score', label: 'Sentiment Score', type: 'number' },
      { key: 'positive_pct', label: 'Positive %', type: 'number' },
      { key: 'negative_pct', label: 'Negative %', type: 'number' },
      { key: 'neutral_pct', label: 'Neutral %', type: 'number' },
      { key: 'top_theme', label: 'Top Theme', type: 'text' },
      { key: 'sample_size', label: 'Sample Size', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','warning','critical'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  // Non-AI Features
  { key: 'configurations', path: '/configurations', label: 'Game Configurations', icon: '⚙️', api: '/configurations', ai: false,
    columns: ['name','game_title','config_type','config_key','config_value','environment','version','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'config_type', label: 'Config Type', type: 'select', options: ['gameplay','economy','competitive','social','ux','system','event','ai'] },
      { key: 'config_key', label: 'Config Key', type: 'text' },
      { key: 'config_value', label: 'Config Value', type: 'text' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['development','staging','production'] },
      { key: 'version', label: 'Version', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','testing','deprecated'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'player-profiles', path: '/player-profiles', label: 'Player Profiles', icon: '👤', api: '/player-profiles', ai: false,
    columns: ['name','player_type','skill_level','play_style','avg_session_time','spending_tier','retention_risk','lifetime_value','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'player_type', label: 'Player Type', type: 'text' },
      { key: 'skill_level', label: 'Skill Level', type: 'select', options: ['beginner','intermediate','advanced','expert'] },
      { key: 'play_style', label: 'Play Style', type: 'text' },
      { key: 'avg_session_time', label: 'Avg Session (min)', type: 'number' },
      { key: 'preferred_difficulty', label: 'Preferred Difficulty', type: 'select', options: ['easy','medium','hard','extreme'] },
      { key: 'spending_tier', label: 'Spending Tier', type: 'select', options: ['free','mid-tier','premium','whale'] },
      { key: 'retention_risk', label: 'Retention Risk', type: 'select', options: ['low','medium','high'] },
      { key: 'lifetime_value', label: 'Lifetime Value ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','at-risk','new','churned'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'scenarios', path: '/scenarios', label: 'Test Scenarios', icon: '🧪', api: '/scenarios', ai: false,
    columns: ['name','game_title','scenario_type','ai_player_count','duration_minutes','priority','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'scenario_type', label: 'Scenario Type', type: 'select', options: ['combat','economy','multiplayer','onboarding','difficulty','monetization','anti-cheat','progression','balance','social','competitive','content','technical'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'preconditions', label: 'Preconditions', type: 'textarea' },
      { key: 'expected_outcome', label: 'Expected Outcome', type: 'textarea' },
      { key: 'ai_player_count', label: 'AI Player Count', type: 'number' },
      { key: 'duration_minutes', label: 'Duration (min)', type: 'number' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','running','completed','failed'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'balance-rules', path: '/balance-rules', label: 'Balance Rules', icon: '📏', api: '/balance-rules', ai: false,
    columns: ['name','game_title','rule_type','target_metric','threshold_min','threshold_max','auto_apply','severity','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'rule_type', label: 'Rule Type', type: 'select', options: ['win-rate','pick-rate','damage','healing','economy','progression','combat','pacing','fairness','engagement','difficulty','retention'] },
      { key: 'target_metric', label: 'Target Metric', type: 'text' },
      { key: 'threshold_min', label: 'Threshold Min', type: 'number' },
      { key: 'threshold_max', label: 'Threshold Max', type: 'number' },
      { key: 'action_on_breach', label: 'Action on Breach', type: 'text' },
      { key: 'auto_apply', label: 'Auto Apply', type: 'select', options: ['true','false'] },
      { key: 'severity', label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active','disabled'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'game-items', path: '/game-items', label: 'Game Items', icon: '🗡️', api: '/game-items', ai: false,
    columns: ['name','game_title','item_type','rarity','base_power','cost','drop_rate','usage_rate','win_rate_impact','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'item_type', label: 'Item Type', type: 'select', options: ['weapon','armor','consumable','material','equipment','tool','attachment','cosmetic','accessory'] },
      { key: 'rarity', label: 'Rarity', type: 'select', options: ['common','uncommon','rare','epic','legendary'] },
      { key: 'base_power', label: 'Base Power', type: 'number' },
      { key: 'cost', label: 'Cost', type: 'number' },
      { key: 'drop_rate', label: 'Drop Rate', type: 'number' },
      { key: 'usage_rate', label: 'Usage Rate %', type: 'number' },
      { key: 'win_rate_impact', label: 'Win Rate Impact', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active','disabled','deprecated'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'analytics', path: '/analytics', label: 'Analytics Metrics', icon: '📊', api: '/analytics', ai: false,
    columns: ['name','game_title','metric_type','metric_value','previous_value','change_pct','trend','threshold_alert','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'metric_type', label: 'Metric Type', type: 'select', options: ['engagement','retention','revenue','monetization','technical','experience','competitive','social','quality','viral'] },
      { key: 'metric_value', label: 'Current Value', type: 'number' },
      { key: 'previous_value', label: 'Previous Value', type: 'number' },
      { key: 'change_pct', label: 'Change %', type: 'number' },
      { key: 'time_period', label: 'Time Period', type: 'select', options: ['daily','weekly','monthly','quarterly'] },
      { key: 'trend', label: 'Trend', type: 'select', options: ['up','down','stable'] },
      { key: 'threshold_alert', label: 'Alert', type: 'select', options: ['true','false'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active','paused'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'sessions', path: '/sessions', label: 'Session History', icon: '📋', api: '/sessions', ai: false,
    columns: ['name','game_title','session_type','player_count','ai_player_count','avg_score','completion_rate','issues_found','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'session_type', label: 'Session Type', type: 'select', options: ['automated','stress','simulation','balance','onboarding','combat','security','difficulty','event','matchmaking','progression','pvp','seasonal','content','regression'] },
      { key: 'player_count', label: 'Player Count', type: 'number' },
      { key: 'ai_player_count', label: 'AI Player Count', type: 'number' },
      { key: 'avg_score', label: 'Avg Score', type: 'number' },
      { key: 'completion_rate', label: 'Completion Rate %', type: 'number' },
      { key: 'issues_found', label: 'Issues Found', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending','running','completed','failed'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
  { key: 'reports', path: '/reports', label: 'Reports', icon: '📝', api: '/reports', ai: false,
    columns: ['name','game_title','report_type','generated_by','status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'game_title', label: 'Game Title', type: 'text', required: true },
      { key: 'report_type', label: 'Report Type', type: 'select', options: ['balance','economy','security','retention','matchmaking','meta','onboarding','competitive','revenue','difficulty','social','technical','content','progression','quarterly'] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'findings', label: 'Findings', type: 'textarea' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea' },
      { key: 'generated_by', label: 'Generated By', type: 'select', options: ['AI','Manual'] },
      { key: 'status', label: 'Status', type: 'select', options: ['draft','published','archived'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ]},
];

export { features };

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
      <Route
        path="/*"
        element={
          loggedIn ? (
            <Layout features={features} onLogout={() => setLoggedIn(false)}>
              <Routes>
                <Route path="/" element={<Dashboard features={features} />} />
                {features.map((f) => (
                  <Route key={f.key} path={f.path} element={<FeaturePage feature={f} />} />
                ))}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
