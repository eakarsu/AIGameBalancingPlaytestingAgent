require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'game_balancing_agent',
  user: process.env.DB_USER || 'erolakarsu',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  console.log('🌱 Starting database seed...');

  // Drop and recreate tables
  await pool.query(`
    DROP TABLE IF EXISTS reports CASCADE;
    DROP TABLE IF EXISTS session_history CASCADE;
    DROP TABLE IF EXISTS analytics_metrics CASCADE;
    DROP TABLE IF EXISTS game_items CASCADE;
    DROP TABLE IF EXISTS balance_rules CASCADE;
    DROP TABLE IF EXISTS test_scenarios CASCADE;
    DROP TABLE IF EXISTS player_profiles CASCADE;
    DROP TABLE IF EXISTS game_configurations CASCADE;
    DROP TABLE IF EXISTS sentiment_analyses CASCADE;
    DROP TABLE IF EXISTS meta_analyses CASCADE;
    DROP TABLE IF EXISTS balance_recommendations CASCADE;
    DROP TABLE IF EXISTS progression_models CASCADE;
    DROP TABLE IF EXISTS exploit_reports CASCADE;
    DROP TABLE IF EXISTS economy_settings CASCADE;
    DROP TABLE IF EXISTS difficulty_curves CASCADE;
    DROP TABLE IF EXISTS playtest_sessions CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE playtest_sessions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      ai_player_count INTEGER DEFAULT 10,
      status VARCHAR(50) DEFAULT 'pending',
      difficulty VARCHAR(50) DEFAULT 'medium',
      duration_minutes INTEGER DEFAULT 30,
      avg_completion_rate DECIMAL(5,2) DEFAULT 0,
      avg_score DECIMAL(10,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE difficulty_curves (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      level_range VARCHAR(50),
      curve_type VARCHAR(50) DEFAULT 'linear',
      min_difficulty DECIMAL(5,2) DEFAULT 1,
      max_difficulty DECIMAL(5,2) DEFAULT 10,
      spike_threshold DECIMAL(5,2) DEFAULT 2,
      smoothness_score DECIMAL(5,2) DEFAULT 0,
      player_churn_rate DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE economy_settings (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      currency_name VARCHAR(100),
      daily_earn_rate DECIMAL(10,2) DEFAULT 0,
      daily_spend_rate DECIMAL(10,2) DEFAULT 0,
      inflation_rate DECIMAL(5,2) DEFAULT 0,
      sink_ratio DECIMAL(5,2) DEFAULT 0,
      source_ratio DECIMAL(5,2) DEFAULT 0,
      health_score DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE exploit_reports (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      exploit_type VARCHAR(100),
      severity INTEGER DEFAULT 5,
      description TEXT,
      affected_system VARCHAR(255),
      reproduction_steps TEXT,
      status VARCHAR(50) DEFAULT 'open',
      mitigation TEXT,
      detected_by VARCHAR(100) DEFAULT 'AI',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE progression_models (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      model_type VARCHAR(100),
      player_archetype VARCHAR(100),
      avg_time_to_max DECIMAL(10,2) DEFAULT 0,
      bottleneck_level INTEGER DEFAULT 0,
      engagement_score DECIMAL(5,2) DEFAULT 0,
      retention_rate DECIMAL(5,2) DEFAULT 0,
      monetization_impact DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE balance_recommendations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      target_element VARCHAR(255),
      change_type VARCHAR(100),
      current_value DECIMAL(10,2),
      recommended_value DECIMAL(10,2),
      impact_score DECIMAL(5,2) DEFAULT 0,
      confidence DECIMAL(5,2) DEFAULT 0,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE meta_analyses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      analysis_type VARCHAR(100),
      dominant_strategy VARCHAR(255),
      meta_diversity_score DECIMAL(5,2) DEFAULT 0,
      top_pick_rate DECIMAL(5,2) DEFAULT 0,
      counter_play_score DECIMAL(5,2) DEFAULT 0,
      staleness_index DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE sentiment_analyses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      source VARCHAR(100),
      sentiment_score DECIMAL(5,2) DEFAULT 0,
      positive_pct DECIMAL(5,2) DEFAULT 0,
      negative_pct DECIMAL(5,2) DEFAULT 0,
      neutral_pct DECIMAL(5,2) DEFAULT 0,
      top_theme VARCHAR(255),
      sample_size INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE game_configurations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      config_type VARCHAR(100),
      config_key VARCHAR(255),
      config_value TEXT,
      environment VARCHAR(50) DEFAULT 'development',
      version VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE player_profiles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      player_type VARCHAR(100),
      skill_level VARCHAR(50) DEFAULT 'intermediate',
      play_style VARCHAR(100),
      avg_session_time INTEGER DEFAULT 30,
      preferred_difficulty VARCHAR(50) DEFAULT 'medium',
      spending_tier VARCHAR(50) DEFAULT 'free',
      retention_risk VARCHAR(50) DEFAULT 'low',
      lifetime_value DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE test_scenarios (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      scenario_type VARCHAR(100),
      description TEXT,
      preconditions TEXT,
      expected_outcome TEXT,
      ai_player_count INTEGER DEFAULT 5,
      duration_minutes INTEGER DEFAULT 15,
      priority VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE balance_rules (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      rule_type VARCHAR(100),
      target_metric VARCHAR(255),
      threshold_min DECIMAL(10,2),
      threshold_max DECIMAL(10,2),
      action_on_breach VARCHAR(255),
      auto_apply BOOLEAN DEFAULT false,
      severity VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE game_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      item_type VARCHAR(100),
      rarity VARCHAR(50) DEFAULT 'common',
      base_power DECIMAL(10,2) DEFAULT 0,
      cost DECIMAL(10,2) DEFAULT 0,
      drop_rate DECIMAL(5,4) DEFAULT 0,
      usage_rate DECIMAL(5,2) DEFAULT 0,
      win_rate_impact DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE analytics_metrics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      metric_type VARCHAR(100),
      metric_value DECIMAL(10,2) DEFAULT 0,
      previous_value DECIMAL(10,2) DEFAULT 0,
      change_pct DECIMAL(5,2) DEFAULT 0,
      time_period VARCHAR(50),
      trend VARCHAR(50) DEFAULT 'stable',
      threshold_alert BOOLEAN DEFAULT false,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE session_history (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      session_type VARCHAR(100),
      started_at TIMESTAMP DEFAULT NOW(),
      ended_at TIMESTAMP,
      player_count INTEGER DEFAULT 0,
      ai_player_count INTEGER DEFAULT 0,
      avg_score DECIMAL(10,2) DEFAULT 0,
      completion_rate DECIMAL(5,2) DEFAULT 0,
      issues_found INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'completed',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE reports (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      report_type VARCHAR(100),
      summary TEXT,
      findings TEXT,
      recommendations TEXT,
      generated_by VARCHAR(100) DEFAULT 'AI',
      status VARCHAR(50) DEFAULT 'draft',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed user
  const hash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)`,
    ['admin@gamebalancer.com', hash, 'Game Admin', 'admin']
  );

  // Seed playtest_sessions (15 items)
  const playtests = [
    ['Alpha Combat Test', 'Dragon Quest RPG', 20, 'completed', 'hard', 60, 78.5, 8450],
    ['Tutorial Flow Test', 'Dragon Quest RPG', 50, 'completed', 'easy', 15, 95.2, 1200],
    ['PvP Arena Stress Test', 'Battle Royale X', 100, 'running', 'medium', 45, 62.3, 5600],
    ['Economy Loop Test', 'Farm Sim Deluxe', 30, 'completed', 'medium', 120, 88.1, 15200],
    ['Boss Rush Analysis', 'Dragon Quest RPG', 15, 'completed', 'extreme', 90, 34.7, 22100],
    ['New Player Onboarding', 'Battle Royale X', 40, 'pending', 'easy', 20, 0, 0],
    ['Endgame Content Test', 'MMORPG Legends', 25, 'completed', 'hard', 180, 45.6, 89500],
    ['Multiplayer Sync Test', 'Battle Royale X', 60, 'failed', 'medium', 30, 12.4, 2300],
    ['Crafting System Test', 'Farm Sim Deluxe', 20, 'completed', 'medium', 60, 91.3, 7800],
    ['Speedrun Path Analysis', 'Dragon Quest RPG', 5, 'completed', 'hard', 45, 100, 45200],
    ['Mobile Performance Test', 'Puzzle Blast', 35, 'completed', 'easy', 10, 97.8, 890],
    ['Difficulty Scaling Test', 'Roguelike Dungeon', 30, 'running', 'hard', 40, 55.2, 6700],
    ['Social Feature Test', 'MMORPG Legends', 80, 'completed', 'medium', 60, 76.9, 4500],
    ['Seasonal Event Test', 'Battle Royale X', 45, 'pending', 'medium', 90, 0, 0],
    ['Matchmaking Quality', 'Battle Royale X', 200, 'completed', 'medium', 30, 71.4, 3800],
  ];
  for (const p of playtests) {
    await pool.query(
      `INSERT INTO playtest_sessions (name, game_title, ai_player_count, status, difficulty, duration_minutes, avg_completion_rate, avg_score) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      p
    );
  }

  // Seed difficulty_curves (15 items)
  const difficulties = [
    ['Tutorial Curve', 'Dragon Quest RPG', '1-5', 'exponential', 1, 3, 0.5, 9.2, 2.1, 'active'],
    ['Mid-Game Ramp', 'Dragon Quest RPG', '6-15', 'linear', 3, 7, 1.5, 7.5, 8.4, 'active'],
    ['Endgame Plateau', 'Dragon Quest RPG', '16-20', 'logarithmic', 7, 10, 2.0, 4.3, 22.5, 'warning'],
    ['PvP Ranking Curve', 'Battle Royale X', '1-50', 'sigmoid', 2, 9, 1.8, 6.8, 12.3, 'active'],
    ['Puzzle Difficulty', 'Puzzle Blast', '1-100', 'stepwise', 1, 8, 1.0, 8.1, 5.6, 'active'],
    ['Dungeon Scaling', 'Roguelike Dungeon', '1-10', 'exponential', 2, 10, 3.0, 3.2, 35.2, 'critical'],
    ['Farm Progression', 'Farm Sim Deluxe', '1-30', 'linear', 1, 5, 0.8, 8.9, 3.1, 'active'],
    ['Raid Difficulty', 'MMORPG Legends', '1-12', 'stepwise', 5, 10, 2.5, 5.5, 18.7, 'warning'],
    ['Story Mode Curve', 'Dragon Quest RPG', '1-20', 'polynomial', 1, 8, 1.2, 7.8, 6.2, 'active'],
    ['Survival Scaling', 'Battle Royale X', '1-∞', 'exponential', 3, 10, 2.0, 4.1, 28.9, 'warning'],
    ['Training Grounds', 'MMORPG Legends', '1-5', 'flat', 1, 2, 0.3, 9.8, 0.5, 'active'],
    ['Challenge Mode', 'Puzzle Blast', '1-50', 'exponential', 3, 10, 2.5, 3.8, 31.4, 'critical'],
    ['Casual Mode', 'Farm Sim Deluxe', '1-30', 'flat', 1, 3, 0.5, 9.5, 1.2, 'active'],
    ['Competitive Ladder', 'Battle Royale X', '1-100', 'sigmoid', 4, 10, 1.5, 6.2, 15.8, 'active'],
    ['Boss Scaling', 'Dragon Quest RPG', '1-10', 'stepwise', 5, 10, 3.0, 4.5, 19.3, 'warning'],
  ];
  for (const d of difficulties) {
    await pool.query(
      `INSERT INTO difficulty_curves (name, game_title, level_range, curve_type, min_difficulty, max_difficulty, spike_threshold, smoothness_score, player_churn_rate, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      d
    );
  }

  // Seed economy_settings (15 items)
  const economies = [
    ['Gold Economy', 'Dragon Quest RPG', 'Gold', 500, 450, 2.1, 0.65, 0.72, 7.8, 'active'],
    ['Gem Premium Currency', 'Dragon Quest RPG', 'Gems', 50, 80, 0.5, 0.85, 0.45, 6.2, 'warning'],
    ['Battle Coins', 'Battle Royale X', 'Battle Coins', 200, 180, 1.8, 0.7, 0.68, 8.1, 'active'],
    ['Farm Bucks', 'Farm Sim Deluxe', 'Farm Bucks', 1000, 850, 3.2, 0.55, 0.78, 5.5, 'critical'],
    ['Energy System', 'Puzzle Blast', 'Energy', 100, 100, 0, 1.0, 1.0, 9.5, 'active'],
    ['Dungeon Tokens', 'Roguelike Dungeon', 'Tokens', 300, 350, -1.5, 0.8, 0.6, 8.5, 'active'],
    ['Guild Currency', 'MMORPG Legends', 'Guild Marks', 150, 120, 2.5, 0.6, 0.75, 6.8, 'warning'],
    ['Crafting Materials', 'Farm Sim Deluxe', 'Materials', 2000, 1800, 1.2, 0.7, 0.72, 7.5, 'active'],
    ['PvP Points', 'Battle Royale X', 'PvP Points', 400, 380, 0.8, 0.72, 0.68, 8.2, 'active'],
    ['Season Pass XP', 'Battle Royale X', 'Season XP', 5000, 5000, 0, 1.0, 1.0, 9.0, 'active'],
    ['Enchant Dust', 'Dragon Quest RPG', 'Dust', 100, 150, -2.0, 0.9, 0.5, 4.8, 'critical'],
    ['Star Coins', 'Puzzle Blast', 'Stars', 80, 60, 3.5, 0.5, 0.82, 5.2, 'warning'],
    ['Trade Currency', 'MMORPG Legends', 'Trade Tokens', 600, 550, 1.5, 0.68, 0.72, 7.2, 'active'],
    ['Raid Rewards', 'MMORPG Legends', 'Raid Points', 250, 200, 2.8, 0.58, 0.78, 6.0, 'warning'],
    ['Event Currency', 'Dragon Quest RPG', 'Event Tokens', 800, 800, 0, 1.0, 1.0, 9.2, 'active'],
  ];
  for (const e of economies) {
    await pool.query(
      `INSERT INTO economy_settings (name, game_title, currency_name, daily_earn_rate, daily_spend_rate, inflation_rate, sink_ratio, source_ratio, health_score, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      e
    );
  }

  // Seed exploit_reports (15 items)
  const exploits = [
    ['Gold Duplication Glitch', 'Dragon Quest RPG', 'duplication', 9, 'Players can duplicate gold by rapidly switching inventory tabs during trade', 'Economy', 'Open trade > switch tabs 5x > confirm', 'open', 'Add server-side validation on trade confirmations', 'AI'],
    ['Wall Clip in Arena', 'Battle Royale X', 'movement', 7, 'Players can clip through walls near spawn point B', 'Map', 'Sprint towards wall at 45 degree angle', 'investigating', 'Add collision mesh reinforcement', 'AI'],
    ['Infinite Energy Bug', 'Puzzle Blast', 'resource', 8, 'Setting device time forward grants unlimited energy', 'Energy System', 'Change device clock > reopen app', 'patched', 'Implement server-side time validation', 'AI'],
    ['XP Overflow Exploit', 'MMORPG Legends', 'progression', 6, 'Specific quest chain gives 10x intended XP', 'Progression', 'Complete quest A > abandon > recomplete', 'open', 'Cap XP gain per quest instance', 'Player Report'],
    ['Damage Calculation Error', 'Dragon Quest RPG', 'combat', 10, 'Certain buff stack causes integer overflow dealing max damage', 'Combat', 'Stack 5 power buffs > use special attack', 'critical', 'Add damage cap and buff stack limit', 'AI'],
    ['AFK Farming Bot', 'Farm Sim Deluxe', 'automation', 5, 'Simple macro can automate crop harvesting indefinitely', 'Farming', 'Record click pattern on farm plots', 'investigating', 'Add CAPTCHA on repeated actions', 'AI'],
    ['Matchmaking Manipulation', 'Battle Royale X', 'matchmaking', 8, 'Players can force lower-skill lobbies by disconnecting', 'Matchmaking', 'Disconnect 3 games > queue again', 'open', 'Track disconnects in MMR calculation', 'AI'],
    ['Item Shop Price Mismatch', 'Dragon Quest RPG', 'economy', 7, 'Buy items at NPC price, sell at auction for profit', 'Economy', 'Buy from vendor > list on auction house', 'patched', 'Normalize vendor/auction pricing', 'Player Report'],
    ['Invisible Player Bug', 'Battle Royale X', 'rendering', 9, 'Emote during parachute makes player invisible', 'Rendering', 'Use emote wheel during landing sequence', 'critical', 'Disable emotes during landing phase', 'AI'],
    ['Crafting Dupe Method', 'Farm Sim Deluxe', 'duplication', 8, 'Cancelling craft at exact frame duplicates materials', 'Crafting', 'Start craft > cancel at 99% progress', 'investigating', 'Add atomic transaction to crafting', 'AI'],
    ['Raid Reset Exploit', 'MMORPG Legends', 'progression', 7, 'Leader can reset raid without cooldown', 'Raids', 'Leader disbands party > reforms > re-enters', 'open', 'Add raid instance cooldown per player', 'AI'],
    ['Score Injection', 'Puzzle Blast', 'security', 10, 'Modified API calls can submit arbitrary scores', 'Leaderboard', 'Intercept score API > modify payload', 'critical', 'Add server-side score validation', 'AI'],
    ['Mount Speed Stack', 'MMORPG Legends', 'movement', 4, 'Multiple mount speed buffs stack beyond intended cap', 'Movement', 'Apply 3 speed scrolls > mount', 'open', 'Cap movement speed multiplier', 'AI'],
    ['Free Premium Purchase', 'Dragon Quest RPG', 'payment', 10, 'Race condition in purchase flow allows free items', 'Store', 'Double-tap purchase button rapidly', 'critical', 'Add idempotency keys to purchases', 'AI'],
    ['Zone Boundary Skip', 'MMORPG Legends', 'movement', 5, 'Jump technique bypasses level requirement zones', 'World', 'Jump at specific corner coordinates', 'investigating', 'Add server-side zone validation', 'Player Report'],
  ];
  for (const e of exploits) {
    await pool.query(
      `INSERT INTO exploit_reports (name, game_title, exploit_type, severity, description, affected_system, reproduction_steps, status, mitigation, detected_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      e
    );
  }

  // Seed progression_models (15 items)
  const progressions = [
    ['Casual Player Path', 'Dragon Quest RPG', 'time-based', 'Casual', 720, 12, 6.5, 65.2, 2.5, 'active'],
    ['Hardcore Grinder', 'Dragon Quest RPG', 'skill-based', 'Achiever', 180, 18, 9.2, 92.5, 8.8, 'active'],
    ['Social Butterfly', 'MMORPG Legends', 'social', 'Socializer', 360, 8, 7.8, 78.4, 5.2, 'active'],
    ['Competitive Player', 'Battle Royale X', 'skill-based', 'Killer', 90, 0, 8.5, 85.3, 12.5, 'active'],
    ['Explorer Type', 'Dragon Quest RPG', 'content-based', 'Explorer', 480, 15, 7.2, 71.8, 4.1, 'active'],
    ['Whale Spender', 'Puzzle Blast', 'monetization', 'Whale', 30, 0, 5.5, 55.0, 250.0, 'warning'],
    ['F2P Dedicated', 'Puzzle Blast', 'time-based', 'Free Player', 2160, 45, 4.2, 42.1, 0, 'critical'],
    ['Returning Player', 'MMORPG Legends', 'catch-up', 'Returner', 120, 5, 6.8, 35.6, 6.5, 'active'],
    ['New Player Standard', 'Farm Sim Deluxe', 'tutorial', 'Newcomer', 600, 3, 7.5, 58.9, 3.2, 'active'],
    ['Speedrunner Path', 'Roguelike Dungeon', 'skill-based', 'Speedrunner', 24, 0, 9.8, 98.5, 1.0, 'active'],
    ['Guild Leader Path', 'MMORPG Legends', 'social', 'Leader', 300, 10, 8.8, 95.2, 15.0, 'active'],
    ['Crafter Focus', 'Farm Sim Deluxe', 'content-based', 'Crafter', 450, 20, 7.0, 72.3, 4.8, 'active'],
    ['PvP Only Player', 'Battle Royale X', 'skill-based', 'PvP Focus', 60, 0, 7.5, 68.9, 9.5, 'active'],
    ['Story Completionist', 'Dragon Quest RPG', 'content-based', 'Completionist', 900, 16, 6.0, 82.4, 3.5, 'active'],
    ['Mobile Casual', 'Puzzle Blast', 'time-based', 'Mobile Casual', 1440, 25, 5.8, 48.5, 1.5, 'warning'],
  ];
  for (const p of progressions) {
    await pool.query(
      `INSERT INTO progression_models (name, game_title, model_type, player_archetype, avg_time_to_max, bottleneck_level, engagement_score, retention_rate, monetization_impact, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      p
    );
  }

  // Seed balance_recommendations (15 items)
  const balanceRecs = [
    ['Nerf Warrior Charge', 'Dragon Quest RPG', 'Warrior Charge', 'nerf', 250, 180, 8.5, 92, 'high', 'pending'],
    ['Buff Healer Output', 'Dragon Quest RPG', 'Heal Spell', 'buff', 120, 165, 7.2, 88, 'high', 'approved'],
    ['Reduce Shotgun Spread', 'Battle Royale X', 'Shotgun Spread', 'nerf', 15, 12, 6.8, 75, 'medium', 'pending'],
    ['Increase Sniper Damage', 'Battle Royale X', 'Sniper Damage', 'buff', 85, 95, 5.5, 70, 'low', 'rejected'],
    ['Adjust Crop Yield', 'Farm Sim Deluxe', 'Wheat Yield', 'nerf', 50, 35, 7.8, 85, 'medium', 'pending'],
    ['Buff Puzzle Combo Score', 'Puzzle Blast', 'Combo Multiplier', 'buff', 1.5, 2.0, 4.2, 65, 'low', 'approved'],
    ['Nerf Boss HP Pool', 'Roguelike Dungeon', 'Boss HP', 'nerf', 10000, 7500, 9.1, 95, 'critical', 'pending'],
    ['Rebalance Tank Armor', 'MMORPG Legends', 'Tank Armor', 'adjustment', 500, 450, 6.5, 80, 'medium', 'approved'],
    ['Reduce Cooldown Mage', 'Dragon Quest RPG', 'Fireball CD', 'buff', 8, 6, 5.8, 72, 'medium', 'pending'],
    ['Adjust Loot Drop Rate', 'Roguelike Dungeon', 'Epic Drop Rate', 'buff', 0.02, 0.035, 7.5, 82, 'high', 'pending'],
    ['Nerf Vehicle Speed', 'Battle Royale X', 'Vehicle Max Speed', 'nerf', 120, 95, 8.2, 90, 'high', 'approved'],
    ['Buff Pet Damage', 'Farm Sim Deluxe', 'Pet Attack', 'buff', 25, 40, 3.8, 60, 'low', 'pending'],
    ['Rebalance Raid Boss', 'MMORPG Legends', 'Raid Boss DPS Check', 'adjustment', 15000, 12000, 8.8, 93, 'critical', 'pending'],
    ['Adjust Energy Regen', 'Puzzle Blast', 'Energy Regen Rate', 'buff', 1, 1.5, 6.2, 78, 'medium', 'approved'],
    ['Nerf Gold Farm Route', 'Dragon Quest RPG', 'Gold/Hour Route', 'nerf', 5000, 3500, 7.0, 85, 'high', 'pending'],
  ];
  for (const b of balanceRecs) {
    await pool.query(
      `INSERT INTO balance_recommendations (name, game_title, target_element, change_type, current_value, recommended_value, impact_score, confidence, priority, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      b
    );
  }

  // Seed meta_analyses (15 items)
  const metas = [
    ['Season 5 Meta Report', 'Battle Royale X', 'seasonal', 'SMG Rush', 6.2, 28.5, 5.8, 4.2, 'active'],
    ['Patch 2.1 Impact', 'Dragon Quest RPG', 'patch', 'Mage Burst Combo', 5.5, 35.2, 4.5, 5.8, 'active'],
    ['Raid Tier Analysis', 'MMORPG Legends', 'tier-list', 'Stack Tanks', 4.8, 42.1, 3.8, 6.5, 'warning'],
    ['PvP Class Balance', 'Dragon Quest RPG', 'class-balance', 'Warrior Dominance', 3.2, 48.7, 2.5, 7.8, 'critical'],
    ['Weapon Tier List', 'Battle Royale X', 'tier-list', 'AR + SMG Combo', 7.1, 22.3, 6.5, 3.5, 'active'],
    ['Farming Efficiency', 'Farm Sim Deluxe', 'efficiency', 'Auto-Harvest Path', 5.8, 31.5, 5.2, 4.8, 'active'],
    ['Puzzle Strategy Meta', 'Puzzle Blast', 'strategy', 'Corner Start', 8.2, 15.8, 7.8, 2.1, 'active'],
    ['Dungeon Build Meta', 'Roguelike Dungeon', 'build', 'Glass Cannon', 4.5, 38.9, 4.0, 6.2, 'warning'],
    ['Guild War Strategies', 'MMORPG Legends', 'strategy', 'Zerg Rush', 3.8, 45.2, 3.2, 7.1, 'critical'],
    ['Competitive Loadouts', 'Battle Royale X', 'loadout', 'Stealth Sniper', 6.8, 25.1, 6.2, 3.8, 'active'],
    ['Class Synergies', 'Dragon Quest RPG', 'synergy', 'Mage-Healer Stack', 5.2, 32.8, 4.8, 5.5, 'active'],
    ['Economy Meta', 'Farm Sim Deluxe', 'economy', 'Flower Monopoly', 4.2, 40.5, 3.5, 6.8, 'warning'],
    ['Early Game Rush', 'Roguelike Dungeon', 'strategy', 'Floor Skip Rush', 3.5, 55.2, 2.8, 8.2, 'critical'],
    ['Season Pass Strats', 'Battle Royale X', 'progression', 'Challenge Stack', 7.5, 18.5, 7.0, 2.8, 'active'],
    ['Monthly Meta Trend', 'MMORPG Legends', 'trend', 'Heal Meta Shift', 6.0, 28.8, 5.5, 4.5, 'active'],
  ];
  for (const m of metas) {
    await pool.query(
      `INSERT INTO meta_analyses (name, game_title, analysis_type, dominant_strategy, meta_diversity_score, top_pick_rate, counter_play_score, staleness_index, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      m
    );
  }

  // Seed sentiment_analyses (15 items)
  const sentiments = [
    ['Launch Day Feedback', 'Battle Royale X', 'Steam Reviews', 7.2, 62.5, 18.3, 19.2, 'Server Performance', 5420, 'active'],
    ['Reddit Community Pulse', 'Dragon Quest RPG', 'Reddit', 5.8, 45.2, 32.1, 22.7, 'Balance Complaints', 3280, 'active'],
    ['Discord Chat Analysis', 'MMORPG Legends', 'Discord', 6.5, 55.8, 22.4, 21.8, 'Content Updates', 8920, 'active'],
    ['App Store Reviews', 'Puzzle Blast', 'App Store', 8.1, 72.3, 12.5, 15.2, 'Puzzle Design', 12500, 'active'],
    ['Twitter Mentions', 'Battle Royale X', 'Twitter', 4.5, 35.8, 42.1, 22.1, 'Matchmaking Issues', 2150, 'warning'],
    ['YouTube Comments', 'Dragon Quest RPG', 'YouTube', 6.8, 58.2, 20.5, 21.3, 'Story Quality', 4780, 'active'],
    ['Forum Feedback', 'Farm Sim Deluxe', 'Official Forum', 7.5, 65.1, 15.8, 19.1, 'New Features', 1890, 'active'],
    ['Twitch Chat Sentiment', 'Battle Royale X', 'Twitch', 5.2, 40.5, 35.2, 24.3, 'Skill Gap', 15200, 'active'],
    ['Support Tickets', 'Puzzle Blast', 'Support', 3.8, 22.5, 55.8, 21.7, 'Bug Reports', 890, 'critical'],
    ['Patch Notes Response', 'MMORPG Legends', 'Reddit', 4.2, 30.2, 48.5, 21.3, 'Nerf Backlash', 6540, 'warning'],
    ['Early Access Feedback', 'Roguelike Dungeon', 'Steam Reviews', 7.8, 68.5, 14.2, 17.3, 'Gameplay Loop', 2340, 'active'],
    ['Influencer Opinions', 'Battle Royale X', 'YouTube', 6.2, 52.8, 25.5, 21.7, 'Monetization', 890, 'active'],
    ['Beta Test Survey', 'Farm Sim Deluxe', 'Survey', 8.5, 75.2, 10.5, 14.3, 'Relaxation Factor', 500, 'active'],
    ['Competitive Scene', 'Battle Royale X', 'Twitter', 5.5, 42.1, 38.2, 19.7, 'Weapon Balance', 3420, 'warning'],
    ['Mobile User Feedback', 'Puzzle Blast', 'App Store', 6.8, 58.9, 22.1, 19.0, 'UI/UX Design', 8900, 'active'],
  ];
  for (const s of sentiments) {
    await pool.query(
      `INSERT INTO sentiment_analyses (name, game_title, source, sentiment_score, positive_pct, negative_pct, neutral_pct, top_theme, sample_size, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      s
    );
  }

  // Seed game_configurations (15 items)
  const configs = [
    ['Max Player Level', 'Dragon Quest RPG', 'gameplay', 'max_player_level', '100', 'production', '2.1.0', 'active'],
    ['Match Duration', 'Battle Royale X', 'gameplay', 'match_duration_sec', '1800', 'production', '5.3.0', 'active'],
    ['Respawn Timer', 'Battle Royale X', 'gameplay', 'respawn_timer_sec', '10', 'production', '5.3.0', 'active'],
    ['Daily Login Reward', 'Puzzle Blast', 'economy', 'daily_login_gems', '50', 'production', '1.8.0', 'active'],
    ['Crafting Speed Mult', 'Farm Sim Deluxe', 'gameplay', 'craft_speed_multiplier', '1.0', 'staging', '3.0.0-beta', 'testing'],
    ['PvP Season Length', 'Battle Royale X', 'competitive', 'season_length_days', '90', 'production', '5.3.0', 'active'],
    ['Raid Group Size', 'MMORPG Legends', 'gameplay', 'max_raid_size', '20', 'production', '4.2.0', 'active'],
    ['Energy Max Cap', 'Puzzle Blast', 'economy', 'energy_max', '100', 'production', '1.8.0', 'active'],
    ['Drop Rate Multiplier', 'Roguelike Dungeon', 'gameplay', 'drop_rate_mult', '1.0', 'production', '1.2.0', 'active'],
    ['Guild Member Limit', 'MMORPG Legends', 'social', 'guild_max_members', '50', 'production', '4.2.0', 'active'],
    ['Tutorial Skip', 'Dragon Quest RPG', 'ux', 'allow_tutorial_skip', 'true', 'production', '2.1.0', 'active'],
    ['Auto-Save Interval', 'Farm Sim Deluxe', 'system', 'autosave_interval_sec', '300', 'production', '2.5.0', 'active'],
    ['Chat Filter Level', 'MMORPG Legends', 'social', 'chat_filter_strictness', 'medium', 'production', '4.2.0', 'active'],
    ['XP Multiplier Event', 'Dragon Quest RPG', 'event', 'xp_multiplier', '2.0', 'staging', '2.2.0-event', 'testing'],
    ['AI Difficulty Adapt', 'Roguelike Dungeon', 'ai', 'ai_adapt_rate', '0.15', 'development', '1.3.0-dev', 'testing'],
  ];
  for (const c of configs) {
    await pool.query(
      `INSERT INTO game_configurations (name, game_title, config_type, config_key, config_value, environment, version, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      c
    );
  }

  // Seed player_profiles (15 items)
  const profiles = [
    ['Alex the Achiever', 'achiever', 'expert', 'completionist', 120, 'hard', 'premium', 'low', 450.00, 'active'],
    ['Bella the Builder', 'creator', 'intermediate', 'creative', 90, 'medium', 'mid-tier', 'low', 120.00, 'active'],
    ['Charlie Casual', 'casual', 'beginner', 'relaxed', 20, 'easy', 'free', 'medium', 0, 'active'],
    ['Dana the Duelist', 'competitive', 'expert', 'aggressive', 180, 'extreme', 'premium', 'low', 680.00, 'active'],
    ['Eddie Explorer', 'explorer', 'intermediate', 'wanderer', 60, 'medium', 'free', 'medium', 15.00, 'active'],
    ['Fiona F2P', 'free-player', 'advanced', 'efficient', 45, 'hard', 'free', 'high', 0, 'at-risk'],
    ['Greg the Grinder', 'grinder', 'advanced', 'farming', 240, 'medium', 'mid-tier', 'low', 85.00, 'active'],
    ['Hannah Helper', 'support', 'intermediate', 'cooperative', 75, 'medium', 'free', 'low', 25.00, 'active'],
    ['Ivan the Investor', 'whale', 'beginner', 'pay-to-progress', 30, 'easy', 'whale', 'low', 5200.00, 'active'],
    ['Julia Journeyer', 'story-fan', 'intermediate', 'narrative', 60, 'medium', 'mid-tier', 'medium', 45.00, 'active'],
    ['Kevin Kompetitive', 'esports', 'expert', 'min-maxer', 300, 'extreme', 'premium', 'low', 320.00, 'active'],
    ['Luna the Lurker', 'passive', 'beginner', 'observer', 10, 'easy', 'free', 'high', 0, 'at-risk'],
    ['Mike Mobile', 'mobile', 'beginner', 'quick-session', 8, 'easy', 'free', 'medium', 5.00, 'active'],
    ['Nina Newbie', 'new-player', 'beginner', 'learning', 25, 'easy', 'free', 'high', 0, 'new'],
    ['Oscar Oldschool', 'veteran', 'expert', 'nostalgic', 90, 'hard', 'premium', 'medium', 200.00, 'active'],
  ];
  for (const p of profiles) {
    await pool.query(
      `INSERT INTO player_profiles (name, player_type, skill_level, play_style, avg_session_time, preferred_difficulty, spending_tier, retention_risk, lifetime_value, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      p
    );
  }

  // Seed test_scenarios (15 items)
  const scenarios = [
    ['First Boss Encounter', 'Dragon Quest RPG', 'combat', 'Test if first boss is beatable by average players within 3 attempts', 'Player at level 5 with basic gear', 'Win rate between 40-60%', 20, 10, 'high', 'completed'],
    ['Economy Inflation Test', 'Farm Sim Deluxe', 'economy', 'Run 30-day economy simulation to check inflation', 'Fresh economy state', 'Inflation below 5% monthly', 30, 120, 'critical', 'running'],
    ['Matchmaking Fairness', 'Battle Royale X', 'multiplayer', 'Verify skill-based matchmaking produces fair matches', 'Mixed skill pool of 100 players', 'Win rate variance below 10%', 100, 60, 'high', 'pending'],
    ['Tutorial Completion', 'Puzzle Blast', 'onboarding', 'Measure tutorial completion rate with new players', 'Brand new players', 'Above 90% completion', 50, 15, 'medium', 'completed'],
    ['Raid Balance Check', 'MMORPG Legends', 'combat', 'Test raid boss with different group compositions', 'Max level raid group', 'Clearable by 70% of compositions', 20, 45, 'high', 'pending'],
    ['Difficulty Spike Test', 'Roguelike Dungeon', 'difficulty', 'Identify difficulty spikes in floor 1-10', 'New character', 'No death rate above 80%', 30, 30, 'medium', 'completed'],
    ['P2W Detection', 'Dragon Quest RPG', 'monetization', 'Compare paying vs free player power curves', 'F2P and premium players', 'Power gap below 20%', 40, 180, 'critical', 'running'],
    ['AFK Detection', 'Battle Royale X', 'anti-cheat', 'Test AFK detection system accuracy', 'Mix of active and AFK players', 'Detection rate above 95%', 50, 30, 'medium', 'completed'],
    ['Crafting Progression', 'Farm Sim Deluxe', 'progression', 'Validate crafting unlock pacing feels rewarding', 'New player progression', 'Unlock every 30-45 min', 10, 120, 'medium', 'pending'],
    ['PvP Class Balance', 'Dragon Quest RPG', 'balance', 'Test all class matchups for fairness', 'Max level all classes', 'No matchup beyond 65/35', 30, 60, 'high', 'running'],
    ['Energy Pacing Test', 'Puzzle Blast', 'economy', 'Verify energy system pacing for daily engagement', 'Active daily player', '3-4 sessions per day', 15, 1440, 'medium', 'completed'],
    ['Guild Feature Stress', 'MMORPG Legends', 'social', 'Test guild features with max member count', 'Full 50-member guild', 'All features functional', 50, 60, 'low', 'pending'],
    ['Leaderboard Integrity', 'Battle Royale X', 'competitive', 'Verify leaderboard cannot be manipulated', 'Various exploit attempts', 'No score manipulation possible', 20, 30, 'critical', 'completed'],
    ['Drop Rate Validation', 'Roguelike Dungeon', 'economy', 'Verify item drop rates match design specs', 'Extended play sessions', 'Within 5% of design rates', 10, 240, 'medium', 'running'],
    ['Cross-Platform Sync', 'Puzzle Blast', 'technical', 'Test save data sync across platforms', 'Multi-device players', 'Zero data loss', 5, 30, 'high', 'pending'],
  ];
  for (const s of scenarios) {
    await pool.query(
      `INSERT INTO test_scenarios (name, game_title, scenario_type, description, preconditions, expected_outcome, ai_player_count, duration_minutes, priority, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      s
    );
  }

  // Seed balance_rules (15 items)
  const rules = [
    ['Win Rate Cap', 'Battle Royale X', 'win-rate', 'character_win_rate', 45, 55, 'Flag for nerf review', false, 'high', 'active'],
    ['Pick Rate Alert', 'Battle Royale X', 'pick-rate', 'weapon_pick_rate', 0, 25, 'Flag for design review', false, 'medium', 'active'],
    ['DPS Check', 'Dragon Quest RPG', 'damage', 'class_dps_average', 800, 1200, 'Auto-adjust damage modifier', true, 'high', 'active'],
    ['Healing Output', 'Dragon Quest RPG', 'healing', 'healer_hps', 400, 600, 'Adjust healing coefficients', true, 'medium', 'active'],
    ['Economy Inflation', 'Farm Sim Deluxe', 'economy', 'monthly_inflation_rate', -2, 5, 'Adjust drop rates', false, 'critical', 'active'],
    ['Progression Speed', 'Puzzle Blast', 'progression', 'avg_level_time_min', 15, 45, 'Adjust XP requirements', false, 'medium', 'active'],
    ['TTK Balance', 'Battle Royale X', 'combat', 'time_to_kill_sec', 0.8, 2.5, 'Review weapon damage', false, 'high', 'active'],
    ['Gold Earn Rate', 'Dragon Quest RPG', 'economy', 'gold_per_hour', 200, 800, 'Adjust gold rewards', true, 'medium', 'active'],
    ['Raid Clear Time', 'MMORPG Legends', 'difficulty', 'raid_clear_minutes', 20, 45, 'Adjust boss HP/damage', false, 'high', 'active'],
    ['Match Duration', 'Battle Royale X', 'pacing', 'avg_match_duration_min', 15, 25, 'Adjust circle speed', true, 'medium', 'active'],
    ['F2P Power Gap', 'Dragon Quest RPG', 'fairness', 'f2p_power_ratio', 0.7, 1.0, 'Review premium items', false, 'critical', 'active'],
    ['Energy Surplus', 'Puzzle Blast', 'economy', 'avg_energy_surplus', 0, 50, 'Adjust energy costs', false, 'low', 'active'],
    ['Dungeon Depth', 'Roguelike Dungeon', 'difficulty', 'avg_max_floor', 5, 8, 'Adjust floor difficulty', true, 'medium', 'active'],
    ['Social Engagement', 'MMORPG Legends', 'engagement', 'daily_chat_messages', 10, 999999, 'No action needed', false, 'low', 'active'],
    ['Retention Trigger', 'Farm Sim Deluxe', 'retention', 'day7_retention_rate', 30, 100, 'Trigger engagement campaign', false, 'critical', 'active'],
  ];
  for (const r of rules) {
    await pool.query(
      `INSERT INTO balance_rules (name, game_title, rule_type, target_metric, threshold_min, threshold_max, action_on_breach, auto_apply, severity, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      r
    );
  }

  // Seed game_items (15 items)
  const items = [
    ['Excalibur Sword', 'Dragon Quest RPG', 'weapon', 'legendary', 850, 50000, 0.001, 12.5, 8.2, 'active'],
    ['Iron Shield', 'Dragon Quest RPG', 'armor', 'common', 120, 500, 0.15, 45.2, 1.5, 'active'],
    ['Health Potion', 'Dragon Quest RPG', 'consumable', 'common', 50, 100, 0.5, 89.5, 0.5, 'active'],
    ['Assault Rifle MK2', 'Battle Royale X', 'weapon', 'rare', 420, 0, 0.08, 62.3, 5.8, 'active'],
    ['Golden Hoe', 'Farm Sim Deluxe', 'tool', 'epic', 300, 15000, 0.01, 8.5, 3.2, 'active'],
    ['Mana Crystal', 'Dragon Quest RPG', 'material', 'rare', 0, 2500, 0.05, 35.8, 0, 'active'],
    ['Stealth Cloak', 'Battle Royale X', 'equipment', 'epic', 0, 0, 0.02, 18.9, 7.5, 'active'],
    ['Magic Seeds', 'Farm Sim Deluxe', 'consumable', 'uncommon', 80, 800, 0.12, 55.2, 2.1, 'active'],
    ['Dragon Scale Armor', 'MMORPG Legends', 'armor', 'legendary', 950, 100000, 0.0005, 5.2, 9.5, 'active'],
    ['Puzzle Hint Token', 'Puzzle Blast', 'consumable', 'common', 0, 50, 0.3, 72.1, 1.2, 'active'],
    ['Teleport Scroll', 'Roguelike Dungeon', 'consumable', 'uncommon', 0, 1500, 0.08, 42.5, 4.5, 'active'],
    ['Phoenix Feather', 'Dragon Quest RPG', 'consumable', 'epic', 200, 10000, 0.008, 15.8, 6.8, 'active'],
    ['Sniper Scope', 'Battle Royale X', 'attachment', 'rare', 150, 0, 0.06, 28.5, 4.2, 'active'],
    ['Guild Banner', 'MMORPG Legends', 'cosmetic', 'rare', 0, 5000, 0.03, 22.1, 0, 'active'],
    ['Lucky Charm', 'Roguelike Dungeon', 'accessory', 'epic', 100, 8000, 0.012, 18.2, 5.5, 'active'],
  ];
  for (const i of items) {
    await pool.query(
      `INSERT INTO game_items (name, game_title, item_type, rarity, base_power, cost, drop_rate, usage_rate, win_rate_impact, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      i
    );
  }

  // Seed analytics_metrics (15 items)
  const metrics = [
    ['Daily Active Users', 'Battle Royale X', 'engagement', 125000, 118000, 5.93, 'daily', 'up', false, 'active'],
    ['Average Session Length', 'Dragon Quest RPG', 'engagement', 42.5, 38.2, 11.26, 'weekly', 'up', false, 'active'],
    ['Day 7 Retention', 'Puzzle Blast', 'retention', 35.2, 38.5, -8.57, 'weekly', 'down', true, 'active'],
    ['ARPU', 'Farm Sim Deluxe', 'revenue', 2.85, 2.65, 7.55, 'monthly', 'up', false, 'active'],
    ['Conversion Rate', 'Puzzle Blast', 'monetization', 3.2, 3.5, -8.57, 'monthly', 'down', true, 'active'],
    ['Crash Rate', 'Battle Royale X', 'technical', 0.8, 1.2, -33.33, 'daily', 'down', false, 'active'],
    ['Matchmaking Wait', 'Battle Royale X', 'experience', 12.5, 15.2, -17.76, 'daily', 'down', false, 'active'],
    ['Tutorial Completion', 'Dragon Quest RPG', 'onboarding', 87.5, 82.1, 6.58, 'weekly', 'up', false, 'active'],
    ['Guild Participation', 'MMORPG Legends', 'social', 62.3, 58.9, 5.77, 'weekly', 'up', false, 'active'],
    ['PvP Engagement', 'Battle Royale X', 'competitive', 45.8, 48.2, -4.98, 'weekly', 'down', true, 'active'],
    ['Churn Rate', 'Roguelike Dungeon', 'retention', 8.5, 7.2, 18.06, 'monthly', 'up', true, 'active'],
    ['Revenue Per Session', 'Farm Sim Deluxe', 'revenue', 0.45, 0.42, 7.14, 'daily', 'up', false, 'active'],
    ['Bug Report Rate', 'MMORPG Legends', 'quality', 2.1, 3.5, -40.0, 'weekly', 'down', false, 'active'],
    ['Store Visit Rate', 'Puzzle Blast', 'monetization', 28.5, 25.8, 10.47, 'daily', 'up', false, 'active'],
    ['Friend Invite Rate', 'Battle Royale X', 'viral', 5.2, 4.8, 8.33, 'weekly', 'up', false, 'active'],
  ];
  for (const m of metrics) {
    await pool.query(
      `INSERT INTO analytics_metrics (name, game_title, metric_type, metric_value, previous_value, change_pct, time_period, trend, threshold_alert, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      m
    );
  }

  // Seed session_history (15 items)
  const sessions = [
    ['Morning Playtest Run', 'Dragon Quest RPG', 'automated', '2024-01-15 09:00:00', '2024-01-15 10:30:00', 0, 20, 7850, 82.5, 3, 'completed'],
    ['PvP Stress Test', 'Battle Royale X', 'stress', '2024-01-15 14:00:00', '2024-01-15 15:00:00', 0, 100, 4200, 61.8, 8, 'completed'],
    ['Economy Sim Run', 'Farm Sim Deluxe', 'simulation', '2024-01-14 08:00:00', '2024-01-14 20:00:00', 0, 50, 15600, 95.2, 1, 'completed'],
    ['Balance Test Session', 'Dragon Quest RPG', 'balance', '2024-01-14 10:00:00', '2024-01-14 11:00:00', 5, 15, 9200, 75.3, 5, 'completed'],
    ['New Player Flow', 'Puzzle Blast', 'onboarding', '2024-01-13 09:00:00', '2024-01-13 09:30:00', 0, 30, 1250, 97.1, 0, 'completed'],
    ['Raid Testing', 'MMORPG Legends', 'combat', '2024-01-13 20:00:00', '2024-01-13 22:00:00', 10, 20, 45200, 42.5, 12, 'completed'],
    ['Exploit Hunt', 'Battle Royale X', 'security', '2024-01-12 11:00:00', '2024-01-12 14:00:00', 0, 40, 3100, 55.8, 6, 'completed'],
    ['Difficulty Calibration', 'Roguelike Dungeon', 'difficulty', '2024-01-12 09:00:00', '2024-01-12 10:00:00', 0, 25, 6800, 48.9, 4, 'completed'],
    ['Weekend Event Test', 'Dragon Quest RPG', 'event', '2024-01-11 16:00:00', '2024-01-11 18:00:00', 0, 35, 12400, 88.2, 2, 'completed'],
    ['Matchmaking Analysis', 'Battle Royale X', 'matchmaking', '2024-01-11 13:00:00', '2024-01-11 14:30:00', 0, 200, 3800, 71.5, 3, 'completed'],
    ['Crafting Path Test', 'Farm Sim Deluxe', 'progression', '2024-01-10 08:00:00', '2024-01-10 12:00:00', 0, 15, 8900, 85.6, 1, 'completed'],
    ['Guild Battle Sim', 'MMORPG Legends', 'pvp', '2024-01-10 19:00:00', '2024-01-10 21:00:00', 0, 50, 18500, 58.3, 7, 'completed'],
    ['Season Reset Test', 'Battle Royale X', 'seasonal', '2024-01-09 10:00:00', '2024-01-09 11:00:00', 0, 80, 2500, 92.1, 0, 'completed'],
    ['Puzzle Generation', 'Puzzle Blast', 'content', '2024-01-09 14:00:00', '2024-01-09 15:00:00', 0, 20, 950, 94.5, 1, 'completed'],
    ['Full Regression', 'Dragon Quest RPG', 'regression', '2024-01-08 08:00:00', '2024-01-08 20:00:00', 10, 30, 11200, 79.8, 9, 'completed'],
  ];
  for (const s of sessions) {
    await pool.query(
      `INSERT INTO session_history (name, game_title, session_type, started_at, ended_at, player_count, ai_player_count, avg_score, completion_rate, issues_found, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      s
    );
  }

  // Seed reports (15 items)
  const reports = [
    ['Weekly Balance Report', 'Dragon Quest RPG', 'balance', 'Overall balance health improved 12% this week', 'Warrior class still dominant in PvP; Mage burst combo needs attention', 'Reduce Warrior Charge damage by 15%; Increase Mage cooldowns by 1s', 'AI', 'published'],
    ['Economy Health Check', 'Farm Sim Deluxe', 'economy', 'Gold inflation at 3.2% - above target of 2%', 'Crop prices too high; crafting sinks insufficient', 'Reduce crop sell prices by 10%; Add new gold sink features', 'AI', 'published'],
    ['Exploit Summary Q1', 'Battle Royale X', 'security', '14 exploits detected, 8 patched, 6 pending', 'Critical: wall clip and invisible player bugs', 'Prioritize rendering exploits; Add server-side validation', 'AI', 'published'],
    ['Player Retention Analysis', 'Puzzle Blast', 'retention', 'Day 7 retention dropped to 35.2% from 38.5%', 'Difficulty spike at level 25; energy depletion too fast', 'Smooth difficulty curve; Increase free energy by 20%', 'AI', 'draft'],
    ['Matchmaking Quality', 'Battle Royale X', 'matchmaking', 'Average skill gap in matches: 15% (target: 10%)', 'Low population hours show poor matching', 'Expand matching window during off-peak; Add bot backfill', 'AI', 'published'],
    ['Monthly Meta Report', 'MMORPG Legends', 'meta', 'Tank meta dominance continuing for 3rd month', 'Limited viable DPS options; Healers underrepresented', 'Buff DPS classes across the board; New healer incentives', 'AI', 'published'],
    ['New Player Experience', 'Dragon Quest RPG', 'onboarding', 'Tutorial completion at 87.5% - up from 82.1%', 'Skip button usage high; some players confused by crafting', 'Improve crafting tutorial; Add contextual hints', 'AI', 'draft'],
    ['PvP Season Summary', 'Battle Royale X', 'competitive', 'Season 5 saw 15% increase in PvP participation', 'Top 1% skill gap widening; Mid-tier players stagnating', 'Add division-based matchmaking; Introduce placement matches', 'AI', 'published'],
    ['Monetization Report', 'Farm Sim Deluxe', 'revenue', 'ARPU up 7.55% to $2.85', 'Cosmetic bundles performing well; Energy packs declining', 'Create themed cosmetic sets; Revise energy pricing', 'AI', 'published'],
    ['Difficulty Assessment', 'Roguelike Dungeon', 'difficulty', 'Average run length: 6.2 floors (target: 7)', 'Floor 4 boss causing 68% of run ends', 'Reduce Floor 4 boss HP by 20%; Add checkpoint system', 'AI', 'draft'],
    ['Social Features Report', 'MMORPG Legends', 'social', 'Guild participation up 5.77% week-over-week', 'Cross-guild events driving engagement', 'Expand cross-guild features; Add guild achievements', 'AI', 'published'],
    ['Technical Performance', 'Battle Royale X', 'technical', 'Crash rate reduced to 0.8% from 1.2%', 'Memory leak in replay system fixed; Shader compilation stalls remaining', 'Continue shader optimization; Pre-compile common shaders', 'AI', 'published'],
    ['Content Pipeline Review', 'Puzzle Blast', 'content', '500 new puzzles generated this month', 'Quality score averaging 8.2/10; 12 puzzles flagged unsolvable', 'Improve puzzle validator; Add difficulty estimation', 'AI', 'draft'],
    ['Progression Balance', 'Dragon Quest RPG', 'progression', 'Average time to max level: 420 hours', 'Bottleneck at level 45-50; XP curve too steep', 'Flatten XP curve at mid-levels; Add catchup mechanics', 'Manual', 'published'],
    ['Quarterly Review', 'Battle Royale X', 'quarterly', 'Overall game health score: 7.8/10', 'Strong engagement metrics; Economy needs attention; Exploit backlog growing', 'Prioritize exploit fixes; Begin economy rebalance; Plan new content season', 'AI', 'draft'],
  ];
  for (const r of reports) {
    await pool.query(
      `INSERT INTO reports (name, game_title, report_type, summary, findings, recommendations, generated_by, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      r
    );
  }

  console.log('✅ Database seeded successfully with 15 items per feature!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
