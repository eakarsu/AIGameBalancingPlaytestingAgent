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

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors());
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
