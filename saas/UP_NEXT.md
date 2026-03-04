# UP_NEXT.md

## Active Phase

**Phase 2: Portfolio & Strategies** — 2.1 complete, pick up at 2.2 or 2.3

## What Was Completed

### Phase 2.1 — Strategy Schema & CRUD (2026-03-03, branch: `ph2`)
- Strategy table with Drizzle schema, FK on Trade, 5 account-level risk fields on User
- Migration: `0012_oval_george_stacy.sql`
- 6 playbook Zod schemas with base config + playbook-specific extensions (`lib/ai/strategies/playbook-schemas.ts`)
- `validateStrategyConfig()` and `getDefaultConfig()` helpers
- 6 DB query functions: `getStrategiesByUserId`, `getStrategyById`, `createStrategy`, `updateStrategy`, `getActiveStrategiesByUserId`, `getStrategyTradeStats`
- 3 AI tools: `listStrategies`, `createStrategy`, `updateStrategy` — registered in route, wrapper config, type exports
- Session context updated to inject active strategies alongside open trades
- System prompt updated with 6 playbooks and strategy management guidance
- 36 unit tests across 4 test files (playbook schemas, list/create/update tools) — all passing
- Full suite: 132/132 tests green, tsc clean, lint clean, build passes

### Product Redesign (2026-03-03, merged to main)
- 6 Playbooks replacing 4 ad-hoc strategies
- Account → Strategy → Trade portfolio model
- Two-layer risk engine (strategy-level + account-level)
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

## Next Up

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

None.
