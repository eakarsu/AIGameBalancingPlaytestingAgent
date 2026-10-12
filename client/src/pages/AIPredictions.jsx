import { useState } from 'react';
import { apiPost } from '../api';
import AIReport from '../components/AIReport';
import FullFieldPresets from '../components/FullFieldPresets';

/**
 * Frontend for the 3 new AI endpoints in server/routes/ai.js:
 *   POST /api/ai/win-rate-predict
 *   POST /api/ai/retention-intervention
 *   POST /api/ai/balance-simulate
 *
 * Mirrors styling of BalanceRecommendations.jsx — uses page-header, status-badge,
 * spinner, empty-state classNames already defined in the project's CSS.
 */

const TABS = [
  { id: 'win-rate-predict', label: 'Win Rate Predict' },
  { id: 'retention-intervention', label: 'Retention Intervention' },
  { id: 'balance-simulate', label: 'Balance Simulate' },
  { id: 'ab-test-design', label: 'A/B Test Design' },
  { id: 'patch-notes-generate', label: 'Patch Notes' },
  { id: 'feedback-cluster', label: 'Feedback Cluster' },
];

const PREDICTION_PRESETS = {
  'win-rate-predict': [
    { label: 'Arena rebalance', values: { proposed_changes: 'Reduce Vanguard base damage by 8%\nIncrease Arcanist mana regeneration by 0.5 per second', current_meta: '{"patch":"1.42","vanguard_pick_rate_pct":28,"arcanist_pick_rate_pct":4,"ranked_matches":250000}', classes_or_champions: 'Vanguard\nArcanist\nRanger' } },
    { label: 'Support update', values: { proposed_changes: 'Increase Medic healing cooldown from 6s to 7s\nIncrease Sentinel shield duration from 3s to 3.5s', current_meta: '{"patch":"1.43-rc1","medic_win_rate_pct":54.2,"sentinel_win_rate_pct":47.8,"tier":"Diamond+"}', classes_or_champions: 'Medic\nSentinel\nAssault' } },
    { label: 'Economy patch', values: { proposed_changes: 'Raise Scout utility cost from 200 to 250 credits\nReduce Heavy armor cost from 1200 to 1100 credits', current_meta: '{"patch":"1.44-preview","average_rounds":21.4,"sample_region":"NA","queue":"competitive"}', classes_or_champions: 'Scout\nHeavy\nController' } },
  ],
  'retention-intervention': [
    { label: 'New-player cohort', values: { player_segments: '[{"segment":"first_7_day_churners","players":5000,"payer_status":"mixed"}]', churn_signals: '{"tutorial_exit_pct":31,"day_3_return_pct":22,"reported_friction":"upgrade complexity"}', retention_levers: 'Optional tutorial replay\nProgress checklist\nNon-expiring welcome reward' } },
    { label: 'Lapsed veterans', values: { player_segments: '[{"segment":"veterans_lapsed_30d","players":1800,"average_tenure_days":420}]', churn_signals: '{"content_completion_pct":94,"last_session_minutes":18,"social_group_inactive_pct":46}', retention_levers: 'New-season digest\nReturning-player questline\nFriend-group reactivation prompt' } },
    { label: 'Competitive fatigue', values: { player_segments: '[{"segment":"ranked_high_frequency","players":3200,"matches_per_week":24}]', churn_signals: '{"loss_streak_exit_pct":38,"queue_time_minutes":6.2,"toxicity_reports_per_100":4.1}', retention_levers: 'Queue-time transparency\nVoluntary cooldown reminder\nSportsmanship rewards' } },
  ],
  'balance-simulate': [
    { label: 'Healing cap', values: { current_state: '{"average_match_minutes":18.5,"healer_win_rate_pct":55.1,"healing_per_round":420}', proposed_changes: 'Cap healing at 30% of max HP per round\nAdd a 2-second combat lock to all heals', simulation_runs: 10000 } },
    { label: 'Burst damage', values: { current_state: '{"average_match_minutes":14.2,"burst_class_pick_rate_pct":34,"median_time_to_elimination_seconds":2.8}', proposed_changes: 'Reduce critical multiplier from 2.0 to 1.8\nIncrease defensive cooldown availability by 10%', simulation_runs: 7500 } },
    { label: 'Resource pacing', values: { current_state: '{"gold_per_minute":410,"average_full_build_minute":17,"snowball_win_rate_pct":68}', proposed_changes: 'Increase passive gold by 5%\nReduce first-objective reward by 12%', simulation_runs: 12000 } },
  ],
  'ab-test-design': [
    { label: 'Starter pack test', values: { hypothesis: 'Increasing first-purchase pack value by 20% raises D7 conversion by at least 2 percentage points.', cohorts: 'control, treatment_value_20', primary_metric: 'D7 first-purchase conversion', secondary_metrics: 'D14 ARPU, D30 retention, refund rate', mde_pct: 5, baseline_rate: 0.08, power: 0.8, alpha: 0.05 } },
    { label: 'Tutorial test', values: { hypothesis: 'A shorter guided tutorial improves completion without increasing early support requests.', cohorts: 'control_long_tutorial, treatment_short_tutorial', primary_metric: 'Tutorial completion rate', secondary_metrics: 'D1 retention, support contacts, first-session duration', mde_pct: 4, baseline_rate: 0.62, power: 0.9, alpha: 0.05 } },
    { label: 'Queue messaging', values: { hypothesis: 'Showing an accurate wait estimate reduces queue abandonment.', cohorts: 'control_no_eta, treatment_eta', primary_metric: 'Queue completion rate', secondary_metrics: 'Match starts, cancellation rate, satisfaction score', mde_pct: 3, baseline_rate: 0.74, power: 0.8, alpha: 0.01 } },
  ],
  'patch-notes-generate': [
    { label: 'Balance patch', values: { version: '1.42.0', game_title: 'Aether Arena', changes: 'Vanguard base damage reduced by 8%\nArcanist mana regeneration increased by 0.5 per second\nFixed duplicate quest rewards', tone: 'community-friendly', audience: 'players', include_dev_commentary: true } },
    { label: 'Hotfix notes', values: { version: '1.42.1', game_title: 'Aether Arena', changes: 'Fixed ranked reconnect failures\nDisabled an item duplication path\nRestored missing season rewards', tone: 'direct and reassuring', audience: 'competitive players', include_dev_commentary: true } },
    { label: 'Preview notes', values: { version: '1.43.0-preview', game_title: 'Aether Arena', changes: 'Added two experimental maps\nUpdated onboarding objectives\nAdjusted early-game gold pacing', tone: 'informative and concise', audience: 'public test players', include_dev_commentary: false } },
  ],
  'feedback-cluster': [
    { label: 'Player survey', values: { feedback_items: 'Matchmaking takes too long at night.\nThe new map has strong visual landmarks.\nProgression feels grindy after level 30.\nMobile UI text is too small.', source: 'survey', max_themes: 8 } },
    { label: 'Focus group', values: { feedback_items: 'The tutorial explains movement but not team roles.\nCombat feels responsive.\nReward choices are hard to compare.\nThe final tutorial encounter is too difficult.', source: 'focus_group', max_themes: 6 } },
    { label: 'Community forum', values: { feedback_items: 'Ranked queue balance improved this patch.\nSupport characters need more build variety.\nThe reconnect flow still fails occasionally.\nPatch notes should explain economy changes.', source: 'forum', max_themes: 10 } },
  ],
};

const splitList = (value) => String(value).split(/\n|,/).map((item) => item.trim()).filter(Boolean);
const parseJsonField = (value, label) => {
  try { return JSON.parse(value); }
  catch { throw new Error(`${label} must be valid JSON.`); }
};

function ResultBlock({ result, error, loading, title }) {
  return <AIReport response={result} error={error} loading={loading} title={`${title} result`} />;
}

export default function AIPredictions() {
  const [tab, setTab] = useState('win-rate-predict');

  // Win rate predict
  const [winForm, setWinForm] = useState(PREDICTION_PRESETS['win-rate-predict'][0].values);

  // Retention intervention
  const [retentionForm, setRetentionForm] = useState(PREDICTION_PRESETS['retention-intervention'][0].values);

  // Balance simulate
  const [simForm, setSimForm] = useState(PREDICTION_PRESETS['balance-simulate'][0].values);

  // A/B test design
  const [abForm, setAbForm] = useState(PREDICTION_PRESETS['ab-test-design'][0].values);

  // Patch notes
  const [patchForm, setPatchForm] = useState(PREDICTION_PRESETS['patch-notes-generate'][0].values);

  // Feedback cluster
  const [feedbackForm, setFeedbackForm] = useState(PREDICTION_PRESETS['feedback-cluster'][0].values);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const activeTab = TABS.find((item) => item.id === tab);
  const activeForm = tab === 'win-rate-predict' ? winForm
    : tab === 'retention-intervention' ? retentionForm
      : tab === 'balance-simulate' ? simForm
        : tab === 'ab-test-design' ? abForm
          : tab === 'patch-notes-generate' ? patchForm : feedbackForm;
  const applyForm = (next) => {
    if (tab === 'win-rate-predict') setWinForm(next);
    else if (tab === 'retention-intervention') setRetentionForm(next);
    else if (tab === 'balance-simulate') setSimForm(next);
    else if (tab === 'ab-test-design') setAbForm(next);
    else if (tab === 'patch-notes-generate') setPatchForm(next);
    else setFeedbackForm(next);
    setResult(null);
    setError('');
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let path, body;
      if (tab === 'win-rate-predict') {
        path = '/ai/win-rate-predict';
        body = {
          proposed_changes: splitList(winForm.proposed_changes),
          current_meta: parseJsonField(winForm.current_meta, 'Current meta'),
          classes_or_champions: splitList(winForm.classes_or_champions),
        };
      } else if (tab === 'retention-intervention') {
        path = '/ai/retention-intervention';
        body = {
          player_segments: parseJsonField(retentionForm.player_segments, 'Player segments'),
          churn_signals: parseJsonField(retentionForm.churn_signals, 'Churn signals'),
          retention_levers: splitList(retentionForm.retention_levers),
        };
      } else if (tab === 'balance-simulate') {
        path = '/ai/balance-simulate';
        body = {
          current_state: parseJsonField(simForm.current_state, 'Current state'),
          proposed_changes: splitList(simForm.proposed_changes),
          simulation_runs: Number(simForm.simulation_runs),
        };
      } else if (tab === 'ab-test-design') {
        path = '/ai/ab-test-design';
        body = {
          hypothesis: abForm.hypothesis,
          cohorts: splitList(abForm.cohorts),
          primary_metric: abForm.primary_metric,
          secondary_metrics: splitList(abForm.secondary_metrics),
          mde_pct: Number(abForm.mde_pct),
          baseline_rate: Number(abForm.baseline_rate),
          power: Number(abForm.power),
          alpha: Number(abForm.alpha),
        };
      } else if (tab === 'patch-notes-generate') {
        path = '/ai/patch-notes-generate';
        body = {
          version: patchForm.version,
          game_title: patchForm.game_title,
          changes: splitList(patchForm.changes),
          tone: patchForm.tone,
          audience: patchForm.audience,
          include_dev_commentary: Boolean(patchForm.include_dev_commentary),
        };
      } else {
        path = '/ai/feedback-cluster';
        body = {
          feedback_items: splitList(feedbackForm.feedback_items),
          source: feedbackForm.source,
          max_themes: Number(feedbackForm.max_themes),
        };
      }
      const res = await apiPost(path, body);
      setResult(res);
    } catch (e) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔮 AI Predictions</h1>
          <div className="subtitle">Win rate predictions, retention interventions, and balance simulations.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setTab(t.id);
              setResult(null);
              setError('');
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              border: tab === t.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              background: tab === t.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? '#a5b4fc' : 'var(--text-primary, #e2e8f0)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ai-workspace-panel" style={{ padding: 20 }}>
        <FullFieldPresets
          value={activeForm}
          presets={PREDICTION_PRESETS[tab]}
          disabled={loading}
          onChange={applyForm}
        />
        {tab === 'win-rate-predict' && (
          <>
            <h2 style={{ marginTop: 0 }}>Win Rate Predict</h2>
            <p style={{ opacity: 0.7 }}>
              Predicts class/champion win-rate shifts after proposed balance changes (with confidence + tier shifts).
            </p>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Proposed changes</label>
              <textarea rows={3} value={winForm.proposed_changes}
                onChange={(e) => setWinForm({ ...winForm, proposed_changes: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Current meta context (JSON)</label>
              <textarea rows={3} value={winForm.current_meta}
                onChange={(e) => setWinForm({ ...winForm, current_meta: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Classes or champions (one per line)</label>
              <textarea rows={3} value={winForm.classes_or_champions}
                onChange={(e) => setWinForm({ ...winForm, classes_or_champions: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'retention-intervention' && (
          <>
            <h2 style={{ marginTop: 0 }}>Retention Intervention</h2>
            <p style={{ opacity: 0.7 }}>
              Segment-tailored retention recommendations with explicit harm-avoidance language.
            </p>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Player segments (JSON array)</label>
              <textarea rows={4} value={retentionForm.player_segments}
                onChange={(e) => setRetentionForm({ ...retentionForm, player_segments: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Churn signals (JSON object)</label>
              <textarea rows={3} value={retentionForm.churn_signals}
                onChange={(e) => setRetentionForm({ ...retentionForm, churn_signals: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Available retention levers (one per line)</label>
              <textarea rows={3} value={retentionForm.retention_levers}
                onChange={(e) => setRetentionForm({ ...retentionForm, retention_levers: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'balance-simulate' && (
          <>
            <h2 style={{ marginTop: 0 }}>Balance Simulate</h2>
            <p style={{ opacity: 0.7 }}>
              Aggregate simulation summary (match length, win-rate distributions, economy impact, edge cases, rollout plan).
            </p>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Current state (JSON object)</label>
              <textarea rows={3} value={simForm.current_state}
                onChange={(e) => setSimForm({ ...simForm, current_state: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Proposed changes (one per line)</label>
              <textarea rows={3} value={simForm.proposed_changes}
                onChange={(e) => setSimForm({ ...simForm, proposed_changes: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Simulation runs</label>
              <input type="number" min="1" value={simForm.simulation_runs}
                onChange={(e) => setSimForm({ ...simForm, simulation_runs: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'ab-test-design' && (
          <>
            <h2 style={{ marginTop: 0 }}>A/B Test Design</h2>
            <p style={{ opacity: 0.7 }}>
              Design a rigorous A/B test: cohort allocation, sample size, runtime, guardrails, stop rules.
            </p>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Hypothesis</label>
              <textarea rows={2} value={abForm.hypothesis}
                onChange={(e) => setAbForm({ ...abForm, hypothesis: e.target.value })} />
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Cohorts (comma-separated)</label>
                <input value={abForm.cohorts}
                  onChange={(e) => setAbForm({ ...abForm, cohorts: e.target.value })}
                  placeholder="control, treatment_v1" />
              </div>
              <div className="form-group">
                <label>Primary metric</label>
                <input value={abForm.primary_metric}
                  onChange={(e) => setAbForm({ ...abForm, primary_metric: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Secondary metrics (comma-separated)</label>
              <input value={abForm.secondary_metrics}
                onChange={(e) => setAbForm({ ...abForm, secondary_metrics: e.target.value })} />
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label>MDE %</label>
                <input type="number" value={abForm.mde_pct}
                  onChange={(e) => setAbForm({ ...abForm, mde_pct: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Baseline rate (0-1)</label>
                <input type="number" step="0.01" value={abForm.baseline_rate}
                  onChange={(e) => setAbForm({ ...abForm, baseline_rate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Statistical power (0-1)</label>
                <input type="number" step="0.01" value={abForm.power}
                  onChange={(e) => setAbForm({ ...abForm, power: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Alpha (0-1)</label>
                <input type="number" step="0.01" value={abForm.alpha}
                  onChange={(e) => setAbForm({ ...abForm, alpha: e.target.value })} />
              </div>
            </div>
          </>
        )}

        {tab === 'patch-notes-generate' && (
          <>
            <h2 style={{ marginTop: 0 }}>Patch Notes Generator</h2>
            <p style={{ opacity: 0.7 }}>
              Generate community-ready patch notes from a list of changes (one per line).
            </p>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Version</label>
                <input value={patchForm.version}
                  onChange={(e) => setPatchForm({ ...patchForm, version: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Game title</label>
                <input value={patchForm.game_title}
                  onChange={(e) => setPatchForm({ ...patchForm, game_title: e.target.value })} />
              </div>
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Tone</label>
                <input value={patchForm.tone}
                  onChange={(e) => setPatchForm({ ...patchForm, tone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Audience</label>
                <input value={patchForm.audience}
                  onChange={(e) => setPatchForm({ ...patchForm, audience: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Changes (one per line)</label>
              <textarea rows={6} value={patchForm.changes}
                onChange={(e) => setPatchForm({ ...patchForm, changes: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={patchForm.include_dev_commentary}
                onChange={(e) => setPatchForm({ ...patchForm, include_dev_commentary: e.target.checked })} />
              Include developer commentary
            </label>
          </>
        )}

        {tab === 'feedback-cluster' && (
          <>
            <h2 style={{ marginTop: 0 }}>Feedback Cluster</h2>
            <p style={{ opacity: 0.7 }}>
              Cluster raw player feedback (one item per line) into actionable themes with sentiment + suggested actions.
            </p>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Source</label>
                <input value={feedbackForm.source}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, source: e.target.value })}
                  placeholder="survey | focus_group | forum | discord" />
              </div>
              <div className="form-group">
                <label>Max themes</label>
                <input type="number" value={feedbackForm.max_themes}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, max_themes: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Feedback items (one per line)</label>
              <textarea rows={8} value={feedbackForm.feedback_items}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_items: e.target.value })} />
            </div>
          </>
        )}

        <button className="btn btn-primary" disabled={loading} onClick={submit}
          style={{ padding: '10px 20px', marginTop: 8, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 6, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Running...' : 'Run AI'}
        </button>
      </div>

      <ResultBlock result={result} error={error} loading={loading} title={activeTab.label} />
    </div>
  );
}
