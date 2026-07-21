# Completeness Review: AIGameBalancingPlaytestingAgent

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Prototype-demo**

## Verdict

The repository presents a broad game balancing and playtesting surface (72 source files and 35 route modules), but static evidence is characteristic of a generated prototype. Pages and endpoints demonstrate concepts; they do not establish a verified execution path to version builds/configurations, run reproducible tests, capture telemetry and feedback, compare cohorts, and manage designer decisions.

## Why it is not complete

- 18 files are explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- The route/page inventory includes `aband patches`, `aipredictions`, `balance recommendations`, `cf agentic playtesting bots that play auton`; these surfaces show breadth but not durable execution against authoritative systems.
- 14 files reference model-provider or chat-completion behavior; generic LLM calls are not a substitute for deterministic domain execution, grounding, or evaluation.
- 23 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- Only 3 recognizable test files were found, insufficient to prove the full workflow and failure modes.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to version builds/configurations, run reproducible tests, capture telemetry and feedback, compare cohorts, and manage designer decisions.
- 2. Connect game builds, telemetry, experiment/config systems, bot/simulation workers, survey tools, and issue tracking; replace seed/demo records with durable synchronized data and explicit failure handling.
- 3. Validate metric definitions, deterministic seeds, sample sizes, matchmaking/cohort bias, regressions, and player outcomes.
- 4. Protect player/minor data, label synthetic play, isolate executable builds, and require designer approval.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- Credential/secret fallback or demo-password patterns occur in 3 files and must be removed or made development-only.
- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `client/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `package.json` — declared scripts, runtime dependencies, and application boundaries.
- `server/index.js` — service composition, middleware, and registered routes.
- `server/routes/abCohorts.js` — implemented API surface and domain/AI request handling.
- `server/routes/agenticPlaytestBots.js` — implemented API surface and domain/AI request handling.
- `server/routes/ai.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Treat this as a prototype: use aband patches and aipredictions to select one narrow game balancing and playtesting outcome, quarantine generated gap routes, and implement that outcome end to end with real data, deterministic rules, and tests before adding features.

## Implementation progress

1. Implemented a durable workflow for content-addressed build versions, versioned configurations, deterministic seeds, reproducible metrics, labelled cohorts/outcomes, designer submission/decision and erasure.
2. Added allow-listed game-build, telemetry, experiment-config, simulation, survey and issue-tracker outbox boundaries with idempotency, retry/dead-letter state and connector checkpoints. No executable ingestion, bot farm, telemetry stream or external account is claimed.
3. Added deterministic validation of metric definitions, minimum samples, cohort balance, synthetic labels, minor-data exclusion and reported regressions; matchmaking bias, causality and full statistical adequacy remain disclosed uncertainties.
4. Added explicit tenant/RBAC claims, independent designer approval, append-only evidence, secret rejection, synthetic-play labelling and a hard boundary requiring external executable sandboxing.
5. Added dependency-free domain/contract/authorization/integration-failure/migration/lifecycle tests in CI, migration/config artifacts, quarantined seeds, a non-destructive launcher and documented deployment/provider gaps.

## Runtime acceptance (2026-07-20)

- The first disposable runtime attempt failed before listener ownership because the launcher treated `server/` as an independent package even though the backend package and dependencies live at the repository root.
- The launcher now starts the root backend package, binds Vite strictly to the assigned UI port, and refuses missing assigned ports. Demo seed credentials must come from explicit non-production seed environment variables, and authenticated `GET /api/auth/me` reloads the identity from PostgreSQL.
- Fresh PostgreSQL plus both services passed `startup_login_session_api` on PostgreSQL `55564`, API `5948`, and UI `5949`: startup, bcrypt login, persisted-session lookup, and authenticated API access were exercised.
- The maintained governance suite passed 8/8 tests and the Vite production build completed. Game-build ingestion, simulation workers, telemetry providers, and designer validation remain outside this evidence.
