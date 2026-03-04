# UP_NEXT.md

## Active Phase

**Phase 2: Portfolio & Strategies** — Ready to start

## What Was Completed

### Product Redesign (2026-03-03, branch: `ph3`)
- 6 Playbooks replacing 4 ad-hoc strategies (Event-Driven, Relative Value, Tail Risk, Momentum, Mean Reversion, Macro Thematic)
- Account → Strategy → Trade portfolio model
- Two-layer risk engine (strategy-level + account-level)
- Theme→Strategy, Archetype→Playbook naming
- Compute & Finance architecture: `lib/finance/` interface boundary, V2 Python path, AWS+Terraform option
- All docs rewritten: VISION.md, ARCH.md, PLAN.md, TAXONOMY.md

### Phase 0 Infrastructure (2026-03-01)
- Vercel + Supabase + Upstash Redis + Google OAuth
- Production deploy live, Google sign-in working

### Phase 1: Trading Core (2026-02-28 → 2026-03-01)
- Kalshi REST client with RSA-PSS auth + AES-256-GCM credential encryption
- Settings page + credentials onboarding
- 8 AI tools: `getMarkets`, `getPositions`, `createOrder`, `cancelOrder`, `webSearch`, `xSearch`, `getPortfolio`, `getTradeHistory`
- Trade table with auto-logging
- Session context injection (open trades in system prompt)

---

## Phase 2 Scope

> See `docs/PLAN.md` Phase 2 for full breakdown.

### 2.1 — Strategy Schema & CRUD
- Strategy table (Drizzle schema + migration)
- `listStrategies`, `createStrategy`, `updateStrategy` AI tools
- Strategy config validation per playbook

### 2.2 — Playbook Engine
- Playbook pipeline interface: `scan → research → rank → size → riskCheck → recommend`
- Implement Event-Driven playbook (first, most complete from Phase 1 tools)
- `runStrategy` tool that executes the pipeline

### 2.3 — Risk Engine
- `lib/finance/` module: sizing.ts, risk.ts, indicators.ts, portfolio.ts
- Strategy-level checks (budget, Kelly, entry rules, thesis)
- Account-level checks (exposure, correlation, drawdown, daily loss)
- `getRiskStatus` tool

### 2.4 — Strategy Performance
- Position table + Recommendation table
- Per-strategy P&L tracking
- PerformanceSnapshot table (daily snapshots)

### 2.5 — Account Setup Flow
- Allocated capital setting
- Risk preference defaults
- Account-level risk field UI

---

## Blockers

- `ph3` branch needs to merge to `main` before Phase 2 implementation starts

## Decisions Pending

- Phase 2 sub-phase ordering: start with 2.1 (schema) or 2.3 (lib/finance) first?
- Which playbook to implement first after Event-Driven?
