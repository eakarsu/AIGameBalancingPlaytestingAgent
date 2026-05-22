require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const playtestRoutes = require('./routes/playtests');
const difficultyRoutes = require('./routes/difficulty');
const economyRoutes = require('./routes/economy');
const exploitRoutes = require('./routes/exploits');
const progressionRoutes = require('./routes/progression');
const balanceRoutes = require('./routes/balance');
const metaRoutes = require('./routes/meta');
const sentimentRoutes = require('./routes/sentiment');
const configurationsRoutes = require('./routes/configurations');
const playerProfilesRoutes = require('./routes/playerProfiles');
const scenariosRoutes = require('./routes/scenarios');
const balanceRulesRoutes = require('./routes/balanceRules');
const gameItemsRoutes = require('./routes/gameItems');
const analyticsRoutes = require('./routes/analytics');
const sessionsRoutes = require('./routes/sessions');
const reportsRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const telemetryRoutes = require('./routes/telemetry');

// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_win_rate_predictor_for_post = require('./routes/gap-no-win-rate-predictor-for-post');
const route_gap_no_player_retention_intervention_ai = require('./routes/gap-no-player-retention-intervention-ai');
const route_gap_no_balance_simulation_monte_carlo_endpoi = require('./routes/gap-no-balance-simulation-monte-carlo-endpoi');
const route_gap_no_automated_patch_note_generator = require('./routes/gap-no-automated-patch-note-generator');
const route_gap_no_webhook_dispatchers_for_live_patch = require('./routes/gap-no-webhook-dispatchers-for-live-patch');
const route_gap_no_surveyfocus_group_collection_beyond_r = require('./routes/gap-no-surveyfocus-group-collection-beyond-r');
const route_gap_no_public_patch_notes_site = require('./routes/gap-no-public-patch-notes-site');
const route_gap_no_real_time_websocket_telemetry_streami = require('./routes/gap-no-real-time-websocket-telemetry-streami');
const route_gap_no_multi_tenant_studio_isolation = require('./routes/gap-no-multi-tenant-studio-isolation');
const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playtests', playtestRoutes);
app.use('/api/difficulty', difficultyRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/exploits', exploitRoutes);
app.use('/api/progression', progressionRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/configurations', configurationsRoutes);
app.use('/api/player-profiles', playerProfilesRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/balance-rules', balanceRulesRoutes);
app.use('/api/game-items', gameItemsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Apply pass 5 — additive mechanical routes
app.use('/api/ab-cohorts', require('./routes/abCohorts'));
app.use('/api/patches', require('./routes/patches'));
app.use('/api/agentic-playtest', require('./routes/agenticPlaytestBots'));
app.use('/api/esports-meta', require('./routes/esportsMetaPredictor'));
app.use('/api/power-creep-sentinel', require('./routes/powerCreepSentinel'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/gap-no-win-rate-predictor-for-post', route_gap_no_win_rate_predictor_for_post);
app.use('/api/gap-no-player-retention-intervention-ai', route_gap_no_player_retention_intervention_ai);
app.use('/api/gap-no-balance-simulation-monte-carlo-endpoi', route_gap_no_balance_simulation_monte_carlo_endpoi);
app.use('/api/gap-no-automated-patch-note-generator', route_gap_no_automated_patch_note_generator);
app.use('/api/gap-no-webhook-dispatchers-for-live-patch', route_gap_no_webhook_dispatchers_for_live_patch);
app.use('/api/gap-no-surveyfocus-group-collection-beyond-r', route_gap_no_surveyfocus_group_collection_beyond_r);
app.use('/api/gap-no-public-patch-notes-site', route_gap_no_public_patch_notes_site);
app.use('/api/gap-no-real-time-websocket-telemetry-streami', route_gap_no_real_time_websocket_telemetry_streami);
app.use('/api/gap-no-multi-tenant-studio-isolation', route_gap_no_multi_tenant_studio_isolation);

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
