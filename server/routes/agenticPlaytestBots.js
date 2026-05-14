// Agentic playtesting bots that play autonomously with varying skill levels
// and produce bug and balance reports.
// Audit: batch_04.md / AIGameBalancingPlaytestingAgent / Custom Feature Suggestions #1
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

// POST /api/agentic-playtest/run
// Body: { scenario_id, bot_count?, skill_distribution?, focus? }
router.post('/run', async (req, res) => {
  try {
    const { scenario_id, bot_count = 5, skill_distribution = 'mixed', focus = 'balance' } = req.body || {};

    let scenario = null;
    let balanceState = null;
    try {
      const r = await pool.query(`SELECT * FROM scenarios WHERE id = $1`, [scenario_id]);
      scenario = r.rows[0] || null;
    } catch (_) {}
    try {
      const r = await pool.query(`SELECT * FROM balance ORDER BY id DESC LIMIT 1`);
      balanceState = r.rows[0] || null;
    } catch (_) {}

    const systemPrompt = `You are a multi-agent playtesting orchestrator. Simulate ${bot_count} bots playing a
scenario with a ${skill_distribution} skill distribution. Report findings: bugs (logic, balance, exploit), tuning
recommendations, and a confidence score. Return STRICT JSON only.`;

    const userPrompt = `Scenario: ${JSON.stringify(scenario || { id: scenario_id })}
Current balance state: ${JSON.stringify(balanceState)}
Focus: ${focus} (balance|exploits|onboarding|endgame)
Bot count: ${bot_count}
Skill distribution: ${skill_distribution} (novice|mixed|hardcore)

Return JSON:
{
  "summary": "...",
  "simulated_runs": [
    { "bot_id": "string", "skill": "novice|intermediate|hardcore", "outcome": "win|loss|draw|stuck", "session_minutes": 0, "notable_events": ["..."] }
  ],
  "bugs_found": [{ "title": "string", "severity": "low|medium|high|critical", "repro_hint": "string" }],
  "balance_observations": ["..."],
  "exploit_candidates": [{ "description": "string", "exploit_type": "string", "patch_priority": "low|medium|high" }],
  "tuning_recommendations": [{ "parameter": "string", "current": "string", "suggested": "string", "rationale": "string" }],
  "confidence_pct": 0,
  "disclaimer": "Simulation; verify with real playtests."
}`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS agentic_playtest_runs (
          id SERIAL PRIMARY KEY, user_id INTEGER, scenario_id INTEGER, bot_count INT,
          payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
        )`
      );
      await pool.query(
        `INSERT INTO agentic_playtest_runs (user_id, scenario_id, bot_count, payload) VALUES ($1,$2,$3,$4)`,
        [req.user?.id || null, scenario_id || null, bot_count, JSON.stringify(parsed)]
      );
    } catch (_) {}

    res.json({ scenario_id, bot_count, result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agentic-playtest/runs
router.get('/runs', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, scenario_id, bot_count, payload, created_at FROM agentic_playtest_runs
       ORDER BY created_at DESC LIMIT 30`
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
