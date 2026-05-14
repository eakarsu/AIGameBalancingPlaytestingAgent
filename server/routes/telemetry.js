const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST /api/telemetry/event — no auth required, for game clients
router.post('/event', async (req, res) => {
  const { game_id, event_type, payload, session_id, player_id, timestamp } = req.body;

  if (!game_id || !event_type) {
    return res.status(400).json({ error: 'game_id and event_type are required' });
  }

  try {
    await pool.query(
      `INSERT INTO analytics_metrics (name, game_title, metric_type, metric_value, time_period, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event_type,
        String(game_id),
        'engagement',
        1,
        'daily',
        'active',
        JSON.stringify({ payload, session_id, player_id, recorded_at: timestamp || new Date().toISOString() })
      ]
    );
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
