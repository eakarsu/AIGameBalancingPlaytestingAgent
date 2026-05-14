/*
 * routes/abCohorts.js — Deterministic A/B cohort assignment + persistence.
 *
 * Pass 5 mechanical addition: complements the AI `/ab-test-design` endpoint
 * (which advises) with a deterministic, hash-based cohort assigner that can
 * actually be invoked at runtime. Cohort allocations are persisted so users
 * always end up in the same cohort across calls.
 *
 * No new deps; uses Node's built-in `crypto` for SHA-256 keyed hashing.
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

let _ensured = false;
async function ensureTables() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ab_experiments (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      description TEXT,
      cohorts JSONB NOT NULL,
      hash_seed TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS ab_assignments (
      id SERIAL PRIMARY KEY,
      experiment_key TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      cohort TEXT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (experiment_key, subject_id)
    );
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTables(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });
router.use(auth);

// Pure deterministic bucketing: hash(seed + subject) mod 10000
function bucket(seed, subjectId) {
  const h = crypto.createHash('sha256').update(`${seed}:${subjectId}`).digest('hex');
  // first 13 hex chars -> safe integer
  return parseInt(h.slice(0, 13), 16) % 10000;
}

function pickCohort(cohorts, b) {
  // cohorts: [{name, allocation_pct}]
  let cum = 0;
  for (const c of cohorts) {
    cum += Math.round((c.allocation_pct || 0) * 100);
    if (b < cum) return c.name;
  }
  return cohorts[cohorts.length - 1].name;
}

function validateCohorts(cohorts) {
  if (!Array.isArray(cohorts) || cohorts.length === 0) return 'cohorts must be a non-empty array';
  const sum = cohorts.reduce((a, c) => a + (Number(c.allocation_pct) || 0), 0);
  if (Math.abs(sum - 100) > 0.5) return `allocation_pct must sum to 100, got ${sum}`;
  for (const c of cohorts) {
    if (!c.name) return 'each cohort needs a name';
  }
  return null;
}

// Create / replace experiment
router.post('/experiments', async (req, res) => {
  try {
    const { key, description = null, cohorts, hash_seed } = req.body || {};
    if (!key) return res.status(400).json({ error: 'key is required' });
    const err = validateCohorts(cohorts);
    if (err) return res.status(400).json({ error: err });
    const seed = hash_seed || crypto.randomBytes(8).toString('hex');
    const r = await pool.query(
      `INSERT INTO ab_experiments (key, description, cohorts, hash_seed, created_by)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (key) DO UPDATE SET description=EXCLUDED.description, cohorts=EXCLUDED.cohorts, hash_seed=EXCLUDED.hash_seed, updated_at=CURRENT_TIMESTAMP
       RETURNING *`,
      [key, description, JSON.stringify(cohorts), seed, req.user.id]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/experiments', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM ab_experiments ORDER BY created_at DESC`);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Assign a subject deterministically (idempotent)
router.post('/assign', async (req, res) => {
  try {
    const { experiment_key, subject_id } = req.body || {};
    if (!experiment_key || !subject_id) return res.status(400).json({ error: 'experiment_key and subject_id required' });
    const exp = await pool.query(`SELECT * FROM ab_experiments WHERE key=$1 AND status='active'`, [experiment_key]);
    if (exp.rowCount === 0) return res.status(404).json({ error: 'experiment not found or not active' });
    const cohort = pickCohort(exp.rows[0].cohorts, bucket(exp.rows[0].hash_seed, String(subject_id)));
    const r = await pool.query(
      `INSERT INTO ab_assignments (experiment_key, subject_id, cohort) VALUES ($1,$2,$3)
       ON CONFLICT (experiment_key, subject_id) DO UPDATE SET cohort=EXCLUDED.cohort RETURNING *`,
      [experiment_key, String(subject_id), cohort]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Bucket distribution audit (no DB write)
router.post('/preview', async (req, res) => {
  try {
    const { cohorts, hash_seed = 'preview', sample = 10000 } = req.body || {};
    const err = validateCohorts(cohorts);
    if (err) return res.status(400).json({ error: err });
    const counts = {};
    for (const c of cohorts) counts[c.name] = 0;
    for (let i = 0; i < sample; i++) {
      const c = pickCohort(cohorts, bucket(hash_seed, `subject-${i}`));
      counts[c] = (counts[c] || 0) + 1;
    }
    const dist = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, +(100 * v / sample).toFixed(2)]));
    res.json({ sample, distribution_pct: dist });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Sample-size guidance: classic two-proportion z-test for power 0.8, alpha 0.05
router.post('/sample-size', async (req, res) => {
  try {
    const { baseline_rate, mde, power = 0.8, alpha = 0.05 } = req.body || {};
    if (baseline_rate == null || mde == null) return res.status(400).json({ error: 'baseline_rate and mde required (decimals)' });
    const p1 = Number(baseline_rate);
    const p2 = p1 + Number(mde);
    if (p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1) return res.status(400).json({ error: 'rates must be between 0 and 1' });
    // z-scores: for alpha=0.05 (two-sided)=1.96, power=0.8 -> 0.84
    const zA = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.576 : 1.96;
    const zB = power === 0.8 ? 0.842 : power === 0.9 ? 1.282 : 0.842;
    const pBar = (p1 + p2) / 2;
    const n = Math.ceil(((zA * Math.sqrt(2 * pBar * (1 - pBar)) + zB * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / ((p2 - p1) ** 2));
    res.json({ baseline_rate: p1, mde: p2 - p1, power, alpha, sample_size_per_arm: n, total_sample: n * 2 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
