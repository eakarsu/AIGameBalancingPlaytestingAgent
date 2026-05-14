// Esports meta predictor recommending preemptive balance changes to prevent
// dominant strategies.
// Audit: batch_04.md / AIGameBalancingPlaytestingAgent / Custom Feature Suggestions #2
const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../db');
const { callOpenRouter } = require('../openrouter');

const router = express.Router();
router.use(auth);

function parseJSON(t) {
  try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: t };
}

// POST /api/esports-meta/predict { competitive_level?, horizon_weeks? }
router.post('/predict', async (req, res) => {
  try {
    const { competitive_level = 'ranked_top_1pct', horizon_weeks = 4 } = req.body || {};

    let metaSnapshot = { rows: [] };
    let recentPatches = { rows: [] };
    let exploits = { rows: [] };
    try { metaSnapshot = await pool.query(`SELECT * FROM meta ORDER BY captured_at DESC LIMIT 20`); } catch (_) {}
    try { recentPatches = await pool.query(`SELECT * FROM patches ORDER BY released_at DESC LIMIT 10`); } catch (_) {}
    try { exploits = await pool.query(`SELECT * FROM exploits ORDER BY id DESC LIMIT 20`); } catch (_) {}

    const systemPrompt = `You are a competitive game meta analyst. Predict which strategies/picks will dominate
in the coming weeks and recommend pre-emptive nerfs/buffs. Return STRICT JSON only.`;

    const userPrompt = `Competitive level: ${competitive_level}
Horizon (weeks): ${horizon_weeks}
Recent meta snapshots: ${JSON.stringify(metaSnapshot.rows.slice(0, 10))}
Recent patches: ${JSON.stringify(recentPatches.rows.slice(0, 5))}
Reported exploits: ${JSON.stringify(exploits.rows.slice(0, 10))}

Return JSON:
{
  "summary": "...",
  "predicted_dominant_strategies": [
    { "name": "string", "expected_pick_rate_pct": 0, "expected_win_rate_pct": 0, "rationale": "string" }
  ],
  "recommended_changes": [
    { "target": "string", "change_type": "nerf|buff|rework", "magnitude": "small|medium|large", "specific_change": "string", "expected_meta_shift": "string" }
  ],
  "watchlist": [{ "item": "string", "reason": "string" }],
  "patch_timing": { "urgency": "low|medium|high", "recommended_week_offset": 0 },
  "disclaimer": "Predictive only; pair with live telemetry monitoring."
}`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ competitive_level, horizon_weeks, prediction: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/esports-meta/recent
router.get('/recent', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, captured_at, snapshot FROM meta ORDER BY captured_at DESC LIMIT 20`
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
