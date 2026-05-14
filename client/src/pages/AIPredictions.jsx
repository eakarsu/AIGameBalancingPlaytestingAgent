import { useState } from 'react';
import { apiPost } from '../api';

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

function ResultBlock({ result, error }) {
  if (error) {
    return (
      <div className="empty-state" style={{ borderColor: '#ef4444', background: 'rgba(239,68,68,0.05)' }}>
        <div className="icon">⚠️</div>
        <h3>Request failed</h3>
        <p>{error}</p>
      </div>
    );
  }
  if (!result) return null;
  return (
    <div style={{ marginTop: 16, padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)' }}>
      <h3 style={{ marginTop: 0, fontSize: 14, color: 'var(--primary-light, #818cf8)' }}>AI Result</h3>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--text-primary, #e2e8f0)' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default function AIPredictions() {
  const [tab, setTab] = useState('win-rate-predict');

  // Win rate predict
  const [winForm, setWinForm] = useState({
    proposed_changes: 'Reduce Champion A base damage by 8%; buff Champion B mana regen by 0.5/s',
    current_meta: 'Champion A overpresent at 28% pick rate; Champion B underused at 4% pick rate',
  });

  // Retention intervention
  const [retentionForm, setRetentionForm] = useState({
    cohort: 'first_7_day_churners',
    sample_size: 5000,
    notes: 'High-value first purchase users that lapse before day 30.',
  });

  // Balance simulate
  const [simForm, setSimForm] = useState({
    proposed_changes: 'Cap healing at 30% of max HP per round; add 2s combat lock to all heals.',
    matches_to_simulate: 10000,
    economy_changes: '',
  });

  // A/B test design
  const [abForm, setAbForm] = useState({
    hypothesis: 'Increasing first-purchase pack value by 20% raises D7 conversion by >=2pp.',
    cohorts: 'control, treatment_v1',
    primary_metric: 'D7 first-purchase conversion',
    secondary_metrics: 'D14 ARPU, D30 retention',
    mde_pct: 5,
    baseline_rate: 0.08,
  });

  // Patch notes
  const [patchForm, setPatchForm] = useState({
    version: '1.42.0',
    changes: 'Champion A base damage -8%; Champion B mana regen +0.5/s; gold-per-min +5%; fix exploit X.',
    tone: 'community-friendly',
    audience: 'players',
  });

  // Feedback cluster
  const [feedbackForm, setFeedbackForm] = useState({
    feedback_items: 'Matchmaking is too slow.\nLove the new map!\nEconomy feels grindy after level 30.\nUI text is too small on mobile.',
    source: 'survey',
    max_themes: 8,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let path, body;
      if (tab === 'win-rate-predict') {
        path = '/ai/win-rate-predict';
        body = winForm;
      } else if (tab === 'retention-intervention') {
        path = '/ai/retention-intervention';
        body = { ...retentionForm, sample_size: Number(retentionForm.sample_size) || undefined };
      } else if (tab === 'balance-simulate') {
        path = '/ai/balance-simulate';
        body = { ...simForm, matches_to_simulate: Number(simForm.matches_to_simulate) || undefined };
      } else if (tab === 'ab-test-design') {
        path = '/ai/ab-test-design';
        body = {
          hypothesis: abForm.hypothesis,
          cohorts: abForm.cohorts.split(',').map((s) => s.trim()).filter(Boolean),
          primary_metric: abForm.primary_metric,
          secondary_metrics: abForm.secondary_metrics.split(',').map((s) => s.trim()).filter(Boolean),
          mde_pct: Number(abForm.mde_pct) || undefined,
          baseline_rate: Number(abForm.baseline_rate) || undefined,
        };
      } else if (tab === 'patch-notes-generate') {
        path = '/ai/patch-notes-generate';
        body = {
          version: patchForm.version,
          changes: patchForm.changes.split('\n').map((s) => s.trim()).filter(Boolean),
          tone: patchForm.tone,
          audience: patchForm.audience,
        };
      } else {
        path = '/ai/feedback-cluster';
        body = {
          feedback_items: feedbackForm.feedback_items.split('\n').map((s) => s.trim()).filter(Boolean),
          source: feedbackForm.source,
          max_themes: Number(feedbackForm.max_themes) || undefined,
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

      <div style={{ padding: 20, background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
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
            <div className="form-group">
              <label>Current meta context</label>
              <textarea rows={2} value={winForm.current_meta}
                onChange={(e) => setWinForm({ ...winForm, current_meta: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'retention-intervention' && (
          <>
            <h2 style={{ marginTop: 0 }}>Retention Intervention</h2>
            <p style={{ opacity: 0.7 }}>
              Segment-tailored retention recommendations with explicit harm-avoidance language.
            </p>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Cohort</label>
                <input value={retentionForm.cohort}
                  onChange={(e) => setRetentionForm({ ...retentionForm, cohort: e.target.value })}
                  placeholder="e.g., first_7_day_churners, vet_lapsing, paying_lapsed"
                />
              </div>
              <div className="form-group">
                <label>Sample size</label>
                <input type="number" value={retentionForm.sample_size}
                  onChange={(e) => setRetentionForm({ ...retentionForm, sample_size: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes / context</label>
              <textarea rows={3} value={retentionForm.notes}
                onChange={(e) => setRetentionForm({ ...retentionForm, notes: e.target.value })} />
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
              <label>Proposed changes</label>
              <textarea rows={3} value={simForm.proposed_changes}
                onChange={(e) => setSimForm({ ...simForm, proposed_changes: e.target.value })} />
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Matches to simulate</label>
                <input type="number" value={simForm.matches_to_simulate}
                  onChange={(e) => setSimForm({ ...simForm, matches_to_simulate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Economy changes</label>
                <input value={simForm.economy_changes} placeholder="e.g., gold-per-min +5%"
                  onChange={(e) => setSimForm({ ...simForm, economy_changes: e.target.value })} />
              </div>
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
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                <label>Tone</label>
                <input value={patchForm.tone}
                  onChange={(e) => setPatchForm({ ...patchForm, tone: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Audience</label>
              <input value={patchForm.audience}
                onChange={(e) => setPatchForm({ ...patchForm, audience: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Changes (one per line)</label>
              <textarea rows={6} value={patchForm.changes}
                onChange={(e) => setPatchForm({ ...patchForm, changes: e.target.value })} />
            </div>
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

      <ResultBlock result={result} error={error} />
    </div>
  );
}
