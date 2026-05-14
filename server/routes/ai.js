const router = require('express').Router();
const { callOpenRouter } = require('../openrouter');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Apply auth and rate limiting to all AI routes
router.use(authMiddleware);
router.use(aiRateLimiter);

// Fire-and-forget persist helper
async function persistToTable(tableName, data) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    await pool.query(
      `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
      values
    );
  } catch (err) {
    // Non-fatal — fire-and-forget
    console.error(`Failed to persist to ${tableName}:`, err.message);
  }
}

// AI Playtest Analysis
router.post('/playtest-analyze', async (req, res) => {
  try {
    const { sessionId, gameConfig } = req.body;
    const result = await callOpenRouter(
      'You are an expert AI game playtesting analyst. Analyze the given game session data and provide detailed insights about player behavior, difficulty issues, and suggestions for improvement. Format your response with clear sections: Summary, Key Findings, Player Behavior Patterns, Difficulty Issues, and Recommendations.',
      `Analyze this playtesting session:\nSession ID: ${sessionId}\nGame Configuration: ${JSON.stringify(gameConfig)}\n\nProvide a comprehensive playtesting analysis with actionable insights.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to reports table
    persistToTable('reports', {
      name: `Playtest Analysis - Session ${sessionId}`,
      game_title: gameConfig?.game_title || 'Unknown',
      report_type: 'balance',
      summary: result.content.substring(0, 500),
      findings: result.content,
      generated_by: 'AI',
      status: 'published'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Difficulty Curve Analysis
router.post('/difficulty-analyze', async (req, res) => {
  try {
    const { levelData, playerMetrics } = req.body;
    const result = await callOpenRouter(
      'You are an expert game difficulty curve analyst. Analyze the difficulty progression data and identify problematic areas such as difficulty spikes, plateaus, or areas where players may churn. Provide specific numeric recommendations for adjustments. Format with: Overview, Difficulty Flow Analysis, Problem Areas, Recommended Adjustments, Expected Impact.',
      `Analyze this difficulty curve data:\nLevel Data: ${JSON.stringify(levelData)}\nPlayer Metrics: ${JSON.stringify(playerMetrics)}\n\nProvide detailed difficulty curve analysis.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to reports table
    persistToTable('reports', {
      name: `Difficulty Analysis - ${levelData?.name || 'Unknown'}`,
      game_title: levelData?.game_title || 'Unknown',
      report_type: 'difficulty',
      summary: result.content.substring(0, 500),
      findings: result.content,
      generated_by: 'AI',
      status: 'published'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Economy Tuning
router.post('/economy-analyze', async (req, res) => {
  try {
    const { economyData, inflationMetrics } = req.body;
    const result = await callOpenRouter(
      'You are an expert game economy designer and analyst. Analyze the in-game economy data including currency flows, item pricing, reward structures, and sink/source balance. Identify inflation risks, exploit opportunities, and suggest tuning parameters. Format with: Economy Health Score, Currency Flow Analysis, Inflation Risk Assessment, Sink/Source Balance, Pricing Recommendations, Action Items.',
      `Analyze this game economy:\nEconomy Data: ${JSON.stringify(economyData)}\nInflation Metrics: ${JSON.stringify(inflationMetrics)}\n\nProvide comprehensive economy tuning recommendations.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to reports table
    persistToTable('reports', {
      name: `Economy Analysis - ${economyData?.name || 'Unknown'}`,
      game_title: economyData?.game_title || 'Unknown',
      report_type: 'economy',
      summary: result.content.substring(0, 500),
      findings: result.content,
      generated_by: 'AI',
      status: 'published'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Exploit Detection
router.post('/exploit-detect', async (req, res) => {
  try {
    const { gameRules, playerActions } = req.body;
    const result = await callOpenRouter(
      'You are an expert game security and exploit detection analyst. Analyze the game mechanics and player behavior data to identify potential exploits, cheats, unintended interactions, and abuse vectors. Rate severity from 1-10 and provide mitigation strategies. Format with: Threat Assessment Summary, Detected Exploits (with severity rating), Unintended Interactions, Abuse Vectors, Mitigation Strategies, Priority Fixes.',
      `Detect exploits in this game data:\nGame Rules: ${JSON.stringify(gameRules)}\nPlayer Actions: ${JSON.stringify(playerActions)}\n\nIdentify all potential exploits and vulnerabilities.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to reports table
    persistToTable('reports', {
      name: `Exploit Detection - ${gameRules?.game || 'Unknown'}`,
      game_title: gameRules?.game || 'Unknown',
      report_type: 'security',
      summary: result.content.substring(0, 500),
      findings: result.content,
      generated_by: 'AI',
      status: 'published'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Progression Modeling
router.post('/progression-analyze', async (req, res) => {
  try {
    const { progressionData, playerSegments } = req.body;
    const result = await callOpenRouter(
      'You are an expert player progression designer. Analyze the progression system data and model optimal player journeys. Identify bottlenecks, pacing issues, and opportunities for engagement. Consider different player archetypes. Format with: Progression Overview, Player Journey Map, Bottleneck Analysis, Pacing Assessment, Archetype-Specific Insights, Optimization Recommendations.',
      `Analyze this progression system:\nProgression Data: ${JSON.stringify(progressionData)}\nPlayer Segments: ${JSON.stringify(playerSegments)}\n\nModel optimal player progression paths.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to reports table
    persistToTable('reports', {
      name: `Progression Analysis - ${progressionData?.name || 'Unknown'}`,
      game_title: progressionData?.game_title || 'Unknown',
      report_type: 'progression',
      summary: result.content.substring(0, 500),
      findings: result.content,
      generated_by: 'AI',
      status: 'published'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Balance Recommendations
router.post('/balance-recommend', async (req, res) => {
  try {
    const { gameStats, unitData } = req.body;
    const result = await callOpenRouter(
      'You are an expert game balance designer. Analyze the game statistics and unit/character data to recommend balance changes. Consider win rates, pick rates, counter-play opportunities, and overall meta health. Format with: Balance Health Report, Overpowered Elements, Underpowered Elements, Proposed Changes (with specific numeric adjustments), Expected Meta Impact, Risk Assessment.',
      `Recommend balance changes:\nGame Stats: ${JSON.stringify(gameStats)}\nUnit Data: ${JSON.stringify(unitData)}\n\nProvide specific balance recommendations with numeric adjustments.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to balance_recommendations
    persistToTable('balance_recommendations', {
      name: `AI Balance Rec - ${gameStats?.name || new Date().toISOString()}`,
      game_title: gameStats?.game_title || 'Unknown',
      target_element: unitData?.element || 'General',
      change_type: 'adjustment',
      impact_score: 5,
      priority: 'medium',
      status: 'pending',
      notes: result.content.substring(0, 1000)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Meta Analysis
router.post('/meta-analyze', async (req, res) => {
  try {
    const { metaData, patchHistory } = req.body;
    const result = await callOpenRouter(
      'You are an expert competitive game meta analyst. Analyze the current game meta including dominant strategies, tier lists, counter-play dynamics, and meta evolution trends. Predict emerging strategies and suggest interventions. Format with: Current Meta State, Tier List, Dominant Strategies, Counter-Play Map, Meta Evolution Trends, Predicted Shifts, Intervention Suggestions.',
      `Analyze the game meta:\nMeta Data: ${JSON.stringify(metaData)}\nPatch History: ${JSON.stringify(patchHistory)}\n\nProvide comprehensive meta analysis and predictions.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to meta_analyses
    persistToTable('meta_analyses', {
      name: `AI Meta Analysis - ${metaData?.name || new Date().toISOString()}`,
      game_title: metaData?.game_title || 'Unknown',
      analysis_type: metaData?.analysis_type || 'seasonal',
      dominant_strategy: metaData?.dominant_strategy || 'Unknown',
      status: 'active',
      notes: result.content.substring(0, 1000)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Sentiment Analysis
router.post('/sentiment-analyze', async (req, res) => {
  try {
    const { feedbackData, source } = req.body;
    const result = await callOpenRouter(
      'You are an expert player sentiment analyst. Analyze player feedback and community sentiment data. Identify key themes, pain points, praise areas, and sentiment trends. Categorize feedback by game aspect and urgency. Format with: Overall Sentiment Score, Key Themes, Pain Points (ranked by frequency and severity), Positive Highlights, Sentiment Trends, Community Health Assessment, Recommended Responses.',
      `Analyze player sentiment:\nFeedback Data: ${JSON.stringify(feedbackData)}\nSource: ${source}\n\nProvide detailed sentiment analysis of player feedback.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to sentiment_analyses
    persistToTable('sentiment_analyses', {
      name: `AI Sentiment - ${feedbackData?.name || new Date().toISOString()}`,
      game_title: feedbackData?.game_title || 'Unknown',
      source: source || 'Unknown',
      status: 'active',
      notes: result.content.substring(0, 1000)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Win Rate Predictor — predict effects of a balance patch on win rates
router.post('/win-rate-predict', async (req, res) => {
  try {
    const { proposed_changes = [], current_meta = {}, classes_or_champions = [] } = req.body || {};
    if (!Array.isArray(proposed_changes) || proposed_changes.length === 0) {
      return res.status(400).json({ error: 'proposed_changes array required' });
    }

    const result = await callOpenRouter(
      'You are a competitive game balance designer. Predict win-rate shifts for the supplied classes/champions after the proposed changes. Account for synergies, counters, and meta context. Return STRICT JSON only.',
      `Current meta context: ${JSON.stringify(current_meta)}
Classes/champions: ${JSON.stringify(classes_or_champions)}
Proposed changes: ${JSON.stringify(proposed_changes)}

Return JSON:
{
  "summary": "...",
  "predicted_win_rates": [
    { "class_or_champion": "string", "current_win_rate_pct": 0, "predicted_win_rate_pct": 0, "delta_pct": 0, "confidence": "low|medium|high", "rationale": "string" }
  ],
  "tier_shifts": [{ "class_or_champion": "string", "from_tier": "string", "to_tier": "string" }],
  "potential_dominant_strategies": ["..."],
  "rollback_recommended_if": ["..."],
  "disclaimer": "Predictions only; verify with live testing."
}`
    );

    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });
    persistToTable('balance_results', {
      name: `Win-rate predict ${new Date().toISOString()}`,
      status: 'active',
      notes: (result.content || '').substring(0, 1000),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Player Retention Intervention
router.post('/retention-intervention', async (req, res) => {
  try {
    const { player_segments = [], churn_signals = {}, retention_levers = [] } = req.body || {};

    const result = await callOpenRouter(
      'You are a live-ops retention specialist. Given player segments and churn signals, recommend tailored retention interventions per segment. Return STRICT JSON only.',
      `Player segments: ${JSON.stringify(player_segments)}
Churn signals: ${JSON.stringify(churn_signals)}
Available retention levers: ${JSON.stringify(retention_levers)}

Return JSON:
{
  "summary": "...",
  "interventions": [
    { "segment": "string", "risk_level": "low|medium|high", "interventions": [
        { "lever": "string", "expected_uplift_pct": 0, "rationale": "string", "estimated_cost": "low|medium|high", "ethical_notes": "string" }
    ] }
  ],
  "monitoring_metrics": ["..."],
  "harm_avoidance": ["avoid dark-pattern engagement loops", "..."],
  "disclaimer": "string"
}`
    );

    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Balance Testing Simulation — simulate outcomes of a balance change
router.post('/balance-simulate', async (req, res) => {
  try {
    const { current_state = {}, proposed_changes = [], simulation_runs = 100 } = req.body || {};

    const result = await callOpenRouter(
      'You are a game-balance simulator. Estimate aggregate outcomes of the proposed changes vs the current state. Return STRICT JSON only.',
      `Current state: ${JSON.stringify(current_state)}
Proposed changes: ${JSON.stringify(proposed_changes)}
Requested simulation runs: ${simulation_runs}

Return JSON:
{
  "summary": "...",
  "expected_match_length_change_pct": 0,
  "win_rate_distribution_post": [
    { "class_or_champion": "string", "low": 0, "median": 0, "high": 0 }
  ],
  "economy_impact": { "currency_inflation_pct": 0, "drop_value_change_pct": 0 },
  "player_experience_impact": { "frustration_score_delta": 0, "engagement_score_delta": 0 },
  "edge_cases_to_test": ["..."],
  "rollout_plan": [{ "phase": "alpha|beta|live", "actions": ["..."] }],
  "disclaimer": "string"
}`
    );

    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================================
// Apply pass 4 (mechanical backlog) — A/B testing, patch notes, feedback
// clustering. Each route 503s when OPENROUTER_API_KEY is missing.
// ==========================================================================

function requireApiKey(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    return false;
  }
  return true;
}

// AI A/B Test Designer — design A/B test plan (cohort assignment, stat-sig sample size)
router.post('/ab-test-design', async (req, res) => {
  try {
    if (!requireApiKey(res)) return;
    const {
      hypothesis = '',
      cohorts = [],
      primary_metric = '',
      secondary_metrics = [],
      mde_pct = 5,
      baseline_rate = 0.5,
      power = 0.8,
      alpha = 0.05,
    } = req.body || {};

    const result = await callOpenRouter(
      'You are an experimentation analyst designing rigorous A/B tests for live games. Return STRICT JSON only.',
      `Hypothesis: ${hypothesis}
Cohorts: ${JSON.stringify(cohorts)}
Primary metric: ${primary_metric}
Secondary metrics: ${JSON.stringify(secondary_metrics)}
Minimum detectable effect (%): ${mde_pct}
Baseline rate (or current value): ${baseline_rate}
Power: ${power}
Alpha: ${alpha}

Return JSON:
{
  "test_name": "string",
  "cohort_assignment": [{"cohort": "string", "allocation_pct": 0, "rationale": "string"}],
  "required_sample_size_per_arm": 0,
  "estimated_runtime_days": 0,
  "guardrail_metrics": ["string"],
  "stop_rules": ["string"],
  "stat_sig_method": "string",
  "potential_biases": ["string"],
  "summary": "string"
}`
    );

    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Patch Notes Generator — generate patch / deployment notes for a list of balance changes
router.post('/patch-notes-generate', async (req, res) => {
  try {
    if (!requireApiKey(res)) return;
    const {
      version = '',
      changes = [],
      tone = 'community-friendly',
      audience = 'players',
      include_dev_commentary = true,
    } = req.body || {};

    const result = await callOpenRouter(
      'You are a senior live-ops community manager writing patch notes. Return STRICT JSON only.',
      `Patch version: ${version}
Audience: ${audience}
Tone: ${tone}
Include dev commentary: ${include_dev_commentary}
Changes:
${JSON.stringify(changes, null, 2)}

Return JSON:
{
  "patch_title": "string",
  "headline_summary": "string",
  "sections": [
    {"category": "Buffs|Nerfs|Bug Fixes|Economy|Quality of Life|Other", "entries": [{"target": "string", "change": "string", "rationale": "string"}]}
  ],
  "dev_commentary": "string",
  "known_issues": ["string"],
  "tldr_bullets": ["string"]
}`
    );

    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });

    // Auto-persist to reports table (existing pattern)
    persistToTable('reports', {
      name: `Patch Notes ${version || ''}`.trim() || 'Patch Notes',
      game_title: req.body?.game_title || 'Unknown',
      report_type: 'balance',
      summary: result.content.substring(0, 500),
      findings: result.content,
      generated_by: 'AI',
      status: 'draft',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Feedback Cluster — cluster survey / focus-group / forum feedback into themes
router.post('/feedback-cluster', async (req, res) => {
  try {
    if (!requireApiKey(res)) return;
    const {
      feedback_items = [],
      source = 'survey',
      max_themes = 8,
    } = req.body || {};

    const result = await callOpenRouter(
      'You are a player-research analyst clustering raw qualitative feedback into actionable themes. Return STRICT JSON only.',
      `Source: ${source}
Max themes: ${max_themes}
Feedback items (string list):
${JSON.stringify(feedback_items, null, 2)}

Return JSON:
{
  "themes": [
    {
      "theme": "string",
      "summary": "string",
      "frequency_pct": 0,
      "sentiment": "positive|negative|neutral|mixed",
      "representative_quotes": ["string"],
      "suggested_actions": ["string"]
    }
  ],
  "outliers": ["string"],
  "overall_summary": "string",
  "top_priority_actions": ["string"]
}`
    );

    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
