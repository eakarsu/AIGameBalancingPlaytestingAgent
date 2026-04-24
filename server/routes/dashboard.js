const router = require('express').Router();
const pool = require('../db');

router.get('/stats', async (req, res) => {
  try {
    const tables = [
      { name: 'playtest_sessions', label: 'Playtest Sessions' },
      { name: 'difficulty_curves', label: 'Difficulty Curves' },
      { name: 'economy_settings', label: 'Economy Settings' },
      { name: 'exploit_reports', label: 'Exploit Reports' },
      { name: 'progression_models', label: 'Progression Models' },
      { name: 'balance_recommendations', label: 'Balance Recommendations' },
      { name: 'meta_analyses', label: 'Meta Analyses' },
      { name: 'sentiment_analyses', label: 'Sentiment Analyses' },
      { name: 'game_configurations', label: 'Game Configurations' },
      { name: 'player_profiles', label: 'Player Profiles' },
      { name: 'test_scenarios', label: 'Test Scenarios' },
      { name: 'balance_rules', label: 'Balance Rules' },
      { name: 'game_items', label: 'Game Items' },
      { name: 'analytics_metrics', label: 'Analytics Metrics' },
      { name: 'session_history', label: 'Session History' },
      { name: 'reports', label: 'Reports' },
    ];

    const stats = await Promise.all(
      tables.map(async (t) => {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${t.name}`);
        return { ...t, count: parseInt(result.rows[0].count) };
      })
    );

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
