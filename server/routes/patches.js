/*
 * routes/patches.js — Patch / deployment registry.
 *
 * Pass 5 mechanical addition: backlog item "Patch / deployment management".
 * The AI patch-notes generator already exists; this gives us actual patch
 * lifecycle persistence (draft → staged → live → rolled_back) with deploy
 * timestamps. Pure CRUD over an additive table.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const ALLOWED_STATUS = ['draft', 'staged', 'live', 'rolled_back', 'archived'];

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patches (
      id SERIAL PRIMARY KEY,
      version_tag TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      changes JSONB DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      staged_at TIMESTAMP,
      deployed_at TIMESTAMP,
      rolled_back_at TIMESTAMP,
      rollback_reason TEXT
    );
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM patches ORDER BY created_at DESC`);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM patches WHERE id=$1`, [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { version_tag, title, description = null, changes = [] } = req.body || {};
    if (!version_tag || !title) return res.status(400).json({ error: 'version_tag and title required' });
    const r = await pool.query(
      `INSERT INTO patches (version_tag, title, description, changes, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [version_tag, title, description, JSON.stringify(changes), req.user.id]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/transition', async (req, res) => {
  try {
    const { status, rollback_reason = null } = req.body || {};
    if (!ALLOWED_STATUS.includes(status)) return res.status(400).json({ error: `status must be one of ${ALLOWED_STATUS.join(', ')}` });
    const stamp = status === 'staged' ? 'staged_at' : status === 'live' ? 'deployed_at' : status === 'rolled_back' ? 'rolled_back_at' : null;
    const sets = ['status = $1'];
    const params = [status];
    if (stamp) sets.push(`${stamp} = CURRENT_TIMESTAMP`);
    if (status === 'rolled_back') { params.push(rollback_reason); sets.push(`rollback_reason = $${params.length}`); }
    params.push(req.params.id);
    const r = await pool.query(`UPDATE patches SET ${sets.join(', ')} WHERE id=$${params.length} RETURNING *`, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM patches WHERE id=$1`, [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
