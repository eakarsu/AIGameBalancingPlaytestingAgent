# Audit Apply Notes — AIGameBalancingPlaytestingAgent

Audit source: `_AUDIT/reports/batch_04.md` (#9). Verdict: substantive (21 routes, 8 AI endpoints).

## Original recommendations

Missing AI counterparts:
- `/win-rate-predictor`
- `/player-retention-intervention`
- `/balance-testing-simulation`

## Implementations applied

Added three AI endpoints to `server/routes/ai.js`:

1. `POST /api/ai/win-rate-predict` — predicts class/champion win-rate shifts after proposed balance changes (with confidence + tier shifts).
2. `POST /api/ai/retention-intervention` — segment-tailored retention recommendations with explicit harm-avoidance language.
3. `POST /api/ai/balance-simulate` — aggregate simulation summary (match length, win-rate distributions, economy impact, edge cases, rollout plan).

All use existing `callOpenRouter` + `persistToTable` patterns. Syntax-checked.

## Backlog (prioritized)

### Mechanical
- A/B testing infrastructure endpoints (cohort assignment, stat-sig).
- Patch / deployment management.
- Survey / focus-group feedback ingestion.

### Needs creds / external
- Twitch / YouTube API integration for streamer-feedback ingestion.
- Real telemetry stream (Kafka, BigQuery) integration.

### Needs product decision
- Cohort segmentation rules.
- Patch-notes generation cadence.

### Custom features
- Agentic playtesting (autonomous bot players).
- Esports meta predictor.
- Cross-game balance patterns library.

## Apply pass 3 (frontend)

LEFT-AS-IS — frontend already wires every backend AI endpoint (JWT Bearer from localStorage, matching existing styling, 503-no-key handled by backend). No changes needed. See `_AUDIT/apply3_logs/ab3_52.md` for details.

## Apply pass 4 (mechanical backlog)

Implemented all 3 mechanical-backlog items (capped at 5).

| # | Item | BE | FE |
|---|------|----|----|
| 1 | A/B testing infrastructure (cohort assignment, stat-sig sample size) | `POST /api/ai/ab-test-design` in `server/routes/ai.js` | `client/src/pages/AIPredictions.jsx` — "A/B Test Design" tab |
| 2 | Patch / deployment notes generator | `POST /api/ai/patch-notes-generate` in `server/routes/ai.js` (auto-persists to `reports`) | "Patch Notes" tab |
| 3 | Survey / focus-group feedback clustering | `POST /api/ai/feedback-cluster` in `server/routes/ai.js` | "Feedback Cluster" tab |

All three endpoints reuse existing `callOpenRouter` helper, return STRICT JSON responses, and 503 when `OPENROUTER_API_KEY` is unset (via local `requireApiKey`). Routes mounted under existing `router.use(authMiddleware)` + `aiRateLimiter`. Frontend uses existing `apiPost` (JWT Bearer from localStorage) and matches `BalanceRecommendations.jsx` styling (page-header, status-badge, btn-primary). `node --check server/routes/ai.js` passes; JSX is project-syntax via vite. No new deps. See `_AUDIT/apply4_logs/ab3_52.md`.

Backlog still deferred: Twitch/YouTube ingestion (NEEDS-CREDS), real telemetry stream (NEEDS-CREDS), agentic playtesting (NEEDS-PRODUCT-DECISION), esports meta predictor + cross-game patterns library (NEEDS-PRODUCT-DECISION).
