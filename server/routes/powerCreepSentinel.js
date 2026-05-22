const router = require('express').Router();

router.post('/score', (req, res) => {
  const { currentWinRate = 50, previousWinRate = 50, pickRate = 10, banRate = 0, patchAgeDays = 7 } = req.body || {};
  const winRateLift = Math.max(0, Number(currentWinRate) - Number(previousWinRate));
  const score = Math.min(100, Math.round(winRateLift * 5 + Math.max(0, Number(currentWinRate) - 52) * 4 + Number(pickRate) * 0.8 + Number(banRate) * 0.7 + Math.max(0, 14 - Number(patchAgeDays)) * 1.5));
  res.json({
    feature: 'power_creep_sentinel',
    score,
    level: score >= 70 ? 'urgent' : score >= 40 ? 'watch' : 'stable',
    recommendations: [
      score >= 70 && 'Run a hotfix simulation with a small damage or cooldown reduction.',
      winRateLift > 4 && 'Compare matchup spread before and after the last patch.',
      Number(pickRate) > 20 && 'Check whether usage concentration is suppressing alternate builds.',
    ].filter(Boolean),
  });
});

module.exports = router;
