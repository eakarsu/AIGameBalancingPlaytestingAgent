const router = require('express').Router();
const { callOpenRouter } = require('../openrouter');
const pool = require('../db');

// AI Playtest Analysis
router.post('/playtest-analyze', async (req, res) => {
  try {
    const { sessionId, gameConfig } = req.body;
    const result = await callOpenRouter(
      'You are an expert AI game playtesting analyst. Analyze the given game session data and provide detailed insights about player behavior, difficulty issues, and suggestions for improvement. Format your response with clear sections: Summary, Key Findings, Player Behavior Patterns, Difficulty Issues, and Recommendations.',
      `Analyze this playtesting session:\nSession ID: ${sessionId}\nGame Configuration: ${JSON.stringify(gameConfig)}\n\nProvide a comprehensive playtesting analysis with actionable insights.`
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage, id: result.id });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
