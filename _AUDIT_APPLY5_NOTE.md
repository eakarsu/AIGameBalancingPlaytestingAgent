# Apply Pass 5 — AIGameBalancingPlaytestingAgent
Date: 2026-05-08
Stack: Node-Express + React (Vite), Postgres `pg`.

## Verified present
- All audit-flagged AI counterparts already present (passes 2–4): `/win-rate-predict`, `/retention-intervention`, `/balance-simulate`, plus mechanical pass-4 additions `/ab-test-design`, `/patch-notes-generate`, `/feedback-cluster`.
- 21 non-AI route files all present.

## Implemented this pass (2 mechanical features, 8 endpoints; additive only)
The pass-4 backlog had AI *advisors* for A/B and patch-notes; this pass adds the actual deterministic / lifecycle machinery so the advice can be acted on at runtime.

1. **Deterministic A/B cohort assignment + sample-size calculator** — closes mechanical backlog "A/B testing infrastructure (cohort assignment, stat-sig)".
   - `server/routes/abCohorts.js` (~140 lines): SHA-256 keyed bucketing, persistent assignments, distribution preview, two-proportion z-test sample-size calc. No new deps (Node `crypto`).
   - Endpoints: `POST/GET /api/ab-cohorts/experiments`, `POST /api/ab-cohorts/assign`, `POST /api/ab-cohorts/preview`, `POST /api/ab-cohorts/sample-size`.
2. **Patch / deployment registry** — closes mechanical backlog "Patch / deployment management".
   - `server/routes/patches.js` (~80 lines): full CRUD + state-machine transitions (draft → staged → live → rolled_back), with timestamps + rollback-reason persisted.
   - Endpoints: `GET/POST /api/patches`, `GET /api/patches/:id`, `POST /api/patches/:id/transition`, `DELETE /api/patches/:id`.
3. **Frontend** — `client/src/pages/ABAndPatches.jsx`, route `/ab-patches` added in `client/src/App.jsx`. Uses existing `apiGet`/`apiPost` (JWT bearer from localStorage).
4. Routes wired in `server/index.js` after the existing `/api/telemetry` registration.

## Deferred
- **Twitch / YouTube streamer-feedback ingestion** — NEEDS-CREDS (Twitch API + YouTube Data API).
- **Real-telemetry stream (Kafka, BigQuery)** — NEEDS-CREDS + infra.
- **Survey / focus-group raw ingestion (beyond AI clustering)** — NEEDS-PRODUCT-DECISION (form schema, multi-tenant isolation).
- **Agentic playtesting (autonomous bot players)** — NEEDS-PRODUCT-DECISION + game-engine SDK.
- **Esports meta predictor, cross-game balance patterns library** — NEEDS-PRODUCT-DECISION (data corpus, training set).

## Smoke test
- `node -c` on `abCohorts.js`, `patches.js`, `index.js` — PASS.
- Did not boot (Postgres dependency); idempotent DDL via middleware.
- Sample-size formula spot-check: baseline=0.5, mde=0.05, alpha=0.05, power=0.8 → ≈1565/arm (matches typical online calculators within rounding).
