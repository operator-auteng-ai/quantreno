# Progress Log

> Append-only session log. Never rewrite or delete prior entries.

---

## 2026-02-28 — Planning & Setup

**Phase:** Pre-Phase 0 (Planning)

### Changes
- Created all planning docs: VISION.md, ARCH.md, INFRASTRUCTURE.md, PLAN.md, TAXONOMY.md, STACK.md, CODING-STANDARDS.md, WORKFLOW.md
- Forked Vercel chatbot v3.1 inline at `chatbot/`
- Renamed project from "Kalshi Trading Agent" to "SaaS" — multi-exchange vision (Tradier, Coinbase in V2+)
- Renamed directory from `kalshi-saas/` to `saas/`

### Decisions
- Keep NextAuth (not Supabase Auth) — already functional, add OAuth
- Vercel hosting (not AWS) — ~$75/mo vs $200+, migrate when needed
- QStash fan-out for per-user cron scans — serverless-friendly
- Chatbot inline (not submodule) — heavy divergence expected, no upstream sync benefit
- Product name "saas" (working title) — V2+ adds Tradier, Coinbase, cross-ecosystem mispricings

### Next
- Phase 0.1: Create Vercel project, deploy, verify build

---

## 2026-02-28 — Phase 0.4 + Phase 1.1–1.2

**Phase:** 0.4 (Cleanup) → 1.1 (Kalshi Client) → 1.2 (Onboarding)

### Changes

**Phase 0.4 — Cleanup**
- Removed weather tool (`get-weather.ts`, `weather.tsx`)
- Removed Pyodide Script tag from layout
- Updated system prompt to Operator trading agent persona
- Updated branding: app title, meta tags, suggested actions, "Chatbot" → "Operator" in sidebar
- Removed "Deploy with Vercel" button from chat header
- `package.json` name: `chatbot` → `operator`

**Phase 1.1 — Kalshi REST Client**
- Created `lib/kalshi/types.ts` — full Kalshi API v2 types
- Created `lib/kalshi/client.ts` — RSA-PSS signed REST client with all methods
- Created `lib/kalshi/encrypt.ts` — AES-256-GCM credential encryption
- Created `lib/kalshi/index.ts` — barrel + `getKalshiClientForUser()` helper
- Added `KalshiCredential` table to `lib/db/schema.ts`
- Added credential query helpers to `lib/db/queries.ts`
- Migration: `0009_sparkling_rocket_raccoon.sql`

**Phase 1.2 — Kalshi Onboarding Flow**
- Created `app/(chat)/api/kalshi/credentials/route.ts` (GET/POST/DELETE)
- Created `app/(chat)/settings/page.tsx` (server component)
- Created `components/kalshi-connection-form.tsx` (client component)
- Updated `components/sidebar-user-nav.tsx` — added Settings link
- Updated `components/app-sidebar.tsx` — "Chatbot" → "Operator"

### Files Created
- `lib/kalshi/types.ts`, `client.ts`, `encrypt.ts`, `index.ts`
- `lib/db/migrations/0009_sparkling_rocket_raccoon.sql`
- `app/(chat)/api/kalshi/credentials/route.ts`
- `app/(chat)/settings/page.tsx`
- `components/kalshi-connection-form.tsx`

### Files Modified
- `lib/db/schema.ts`, `lib/db/queries.ts`, `lib/types.ts`
- `lib/ai/prompts.ts`, `app/(chat)/api/chat/route.ts`
- `components/app-sidebar.tsx`, `components/sidebar-user-nav.tsx`
- `components/chat-header.tsx`, `components/suggested-actions.tsx`
- `app/layout.tsx`, `app/(chat)/layout.tsx`, `package.json`

### Commits
- `04c20b1` — Phase 0.4: Strip chatbot template, apply trading agent persona
- `a780cf5` — Phase 1.1: Kalshi REST client, credential encryption, KalshiCredential table
- `c17ded6` — Phase 1.2: Kalshi settings page, credentials API, sidebar updates

### Decisions / Deviations
- Phases 0.1 (Vercel deploy), 0.2 (Supabase), 0.3 (Redis + OAuth) deferred — those require user to set up external services; code work started first
- RSA-PSS auth mechanism discovered from Kalshi MCP source code (not docs)
- `onConflictDoUpdate` on `KalshiCredential.userId` — one credential set per user
- `createOrder` always forces `type: "limit"` — market orders removed from Kalshi Feb 11, 2026
- WORKFLOW.md session end process not followed — UP_NEXT.md and PROGRESS_LOG.md not updated (corrected in 2026-02-28 session 3)

---

## 2026-02-28 — Phase 1.3–1.6

**Phase:** 1.3 (Trading Tools) → 1.4 (Research Tools) → 1.5 (Trading State) → 1.6 (Session Context)

### Changes

**Phase 1.3 — Trading Tools**
- Created `lib/ai/tools/get-markets.ts` — scan Kalshi events/markets with filters
- Created `lib/ai/tools/get-positions.ts` — balance + open positions + resting orders
- Created `lib/ai/tools/create-order.ts` — limit-only order placement (`needsApproval: true`)
- Created `lib/ai/tools/cancel-order.ts` — order cancellation (`needsApproval: true`)

**Phase 1.4 — Research Tools**
- Created `lib/ai/tools/web-search.ts` — Tavily-backed web/news search (`TAVILY_API_KEY`)
- Created `lib/ai/tools/x-search.ts` — X API v2 recent tweet search (`BEARER_TOKEN`)
- Wired all 6 new tools into `app/(chat)/api/chat/route.ts` and `lib/types.ts`

**Phase 1.5 — Trading State (partial)**
- Added `Trade` table to `lib/db/schema.ts`
- Migration: `0010_lucky_doctor_faustus.sql`
- Added `logTrade`, `getOpenTradesByUserId`, `getRecentTradesByUserId`, `closeTradeByOrderId`, `cancelTradeByOrderId` to `lib/db/queries.ts`
- `createOrder` auto-logs trade to DB on execution (fire-and-forget)
- `cancelOrder` marks trade as cancelled in DB (fire-and-forget)
- **Not completed:** Position, Recommendation, Scan tables; `getPortfolio` tool; `getTradeHistory` tool

**Phase 1.6 — Session Context**
- `systemPrompt()` accepts optional `sessionContext?: string`
- Chat route fetches `getOpenTradesByUserId` from DB on each request, injects as system prompt context

### Files Created
- `lib/ai/tools/get-markets.ts`, `get-positions.ts`, `create-order.ts`, `cancel-order.ts`
- `lib/ai/tools/web-search.ts`, `x-search.ts`
- `lib/db/migrations/0010_lucky_doctor_faustus.sql`

### Files Modified
- `lib/db/schema.ts`, `lib/db/queries.ts`
- `lib/ai/prompts.ts`
- `app/(chat)/api/chat/route.ts`
- `lib/types.ts`

### Commits
- `7f0a68b` — Phase 1.3–1.4: Trading AI tools and research tools
- `f46581c` — Phase 1.5–1.6: Trade logging table and session context injection

### Decisions / Deviations
- Phase 1.5 is partial: only Trade table created. Position/Recommendation/Scan tables deferred — unclear if needed separately given Trade table + Kalshi live API covers most use cases. Decision needed.
- `createOrder` and `cancelOrder` DB writes are fire-and-forget (non-fatal) — order success not coupled to DB write
- Session context injection uses DB (Trade table) only, no Kalshi API call on every request — fast but prices are stale (at order entry). `getPortfolio` tool will handle live prices when needed.
- WORKFLOW.md session start process not followed (no doc read order) — UP_NEXT.md and PROGRESS_LOG.md retroactively updated (corrected in this session)
- Added `BEARER_TOKEN` and `TAVILY_API_KEY` as required env vars — not yet in INFRASTRUCTURE.md env var list
- Used context7 MCP for library documentation (added to MEMORY.md)

---

## 2026-03-01 — Phase 0.1–0.3 Infrastructure + Redirect Fix

**Phase:** 0 Infrastructure (Vercel + Supabase + Upstash + Google OAuth)

### Changes

**Infrastructure Setup**
- Created `.env.local` with `AUTH_SECRET`, `KALSHI_ENCRYPTION_KEY`, `POSTGRES_URL`, `REDIS_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- Supabase: project created (ref: `tsmqzoqqrkisxjjxapxp`), POSTGRES_URL (transaction mode, port 6543), ran `pnpm db:migrate` — all 12 tables created
- Upstash Redis: instance created, `REDIS_URL` (rediss:// format for `redis` npm package, not REST API format)
- Google OAuth: Google Cloud Console → OAuth 2.0 client created, redirect URIs added for localhost + Vercel
- All env vars added to Vercel (Production + Preview + Development)
- Vercel deployment connected to `operator-auteng-ai/trading` repo

**Git History Cleanup**
- Rewrote all 22 commits to replace `pwidden@gmail.com / Paul Widden` with `operator@auteng.ai / operator-auteng-ai` using `git filter-branch --env-filter`
- Updated `git config user.email` and `user.name` for future commits
- Force-pushed rewritten history to origin

**proxy.ts Redirect Loop Fix**
- Root cause: `proxy.ts` (Next.js 16 middleware equivalent) was redirecting ALL unauthenticated requests — including `/login` itself — to `/api/auth/guest`, which redirected back to `/login`
- Fix: check `/login` and `/register` AFTER fetching JWT token, not before
  - Authenticated users on auth pages → redirect to `/`
  - Unauthenticated users on auth pages → let through (show the page)
  - Unauthenticated users on all other routes → redirect to `/login`
- Also removed dead `guestRegex` import; changed unauthenticated redirect target from `/api/auth/guest` to `/login` directly

### Files Created
- `saas/chatbot/.env.local`

### Files Modified
- `saas/chatbot/proxy.ts` — auth routing logic rewrite
- `.gitignore` — added `.mcp.json`, `*.tsbuildinfo`
- `saas/chatbot/next-env.d.ts` — updated to prod route types after build

### Commits
- `46bd142` — chore: update gitignore and next-env types after prod build
- `b3cb8ac` — chore: remove tsconfig.tsbuildinfo from git tracking
- `fa370d2` — fix: resolve redirect loop on login page

### Decisions / Deviations
- Single Supabase + Upstash instance for both dev and prod — acceptable for solo dev with no real users; separate dev project deferred to Phase 3+
- Vercel MCP connector (OAuth) added but not surfacing in Claude Code session — connector system incompatible with Claude Code CLI; use Vercel dashboard directly
- `proxy.ts` confirmed as Next.js 16's replacement for `middleware.ts` — was not in initial chatbot fork, caused the redirect loop bug

---

## 2026-03-01 — Phase 1 Closeout: getPortfolio + getTradeHistory

**Phase:** 1.5 (Trading State) — completing remaining gaps

### Changes

**`getPortfolio` tool** (`lib/ai/tools/get-portfolio.ts`)
- Fetches live Kalshi positions, balance, and market data in parallel
- Cross-references Trade table for entry prices
- Computes unrealized P&L per position (current bid vs entry price)
- Returns portfolio summary with totals for unrealized and realized P&L

**`getTradeHistory` tool** (`lib/ai/tools/get-trade-history.ts`)
- Queries Trade table with configurable limit (1–100, default 20)
- Optional status filter (open/closed/cancelled)
- Returns trade details with entry/exit prices, P&L, strategy, notes
- Includes summary counts by status and total realized P&L

**Wiring**
- Both tools registered in `app/(chat)/api/chat/route.ts` (imports, tools object, activeTools list)
- Both tools typed in `lib/types.ts` (imports, InferUITool types, ChatTools union)

### Files Created
- `lib/ai/tools/get-portfolio.ts`
- `lib/ai/tools/get-trade-history.ts`

### Files Modified
- `app/(chat)/api/chat/route.ts`
- `lib/types.ts`

### Decisions
- `getPortfolio` fetches live market prices per position (accurate) — accepted the N+1 API call tradeoff; positions are typically <20, and `Promise.allSettled` handles failures gracefully
- Position/Recommendation/Scan tables deferred — Trade table + Kalshi live API covers Phase 1 needs
- **Phase 1 exit criteria: all met**

---

## 2026-03-03 — Product Redesign: Playbooks, Strategies, Risk Engine, Compute Architecture

**Phase:** Pre-Phase 2 (Product & Architecture Redesign)

### Context

Stepped back before Phase 2 to rethink the product at a fundamental level. The 4 ad-hoc strategies (oil, fat-tails, volatility-swing, spread-arb) were replaced with 6 established financial patterns. The portfolio model, risk engine, naming conventions, and compute architecture were redesigned.

### Changes

**Product Model Redesign (all docs)**
- Replaced 4 ad-hoc strategies with 6 system-provided **Playbooks**: Event-Driven, Relative Value, Tail Risk, Momentum, Mean Reversion, Macro Thematic
- Introduced **Account → Strategy → Trade** hierarchy: users create named Strategies that apply a Playbook to a specific idea (e.g., "War-Driven Oil Shock" uses Event-Driven playbook)
- Added two-layer **Risk Engine**: strategy-level (budget, Kelly, entry/exit rules, thesis) + account-level (exposure cap, correlation, drawdown pause, daily loss limit)
- Positioned product as "allocate cash to AI portfolio manager" for retail investors, not a quant trading tool
- Days-to-months timescales, not microseconds

**Naming Cleanup**
- Renamed Theme → **Strategy**, Archetype → **Playbook** across all docs (more natural for non-finance retail users)

**Compute & Finance Architecture (ARCH.md)**
- Researched TS/JS finance ecosystem — found adequate for V1 binary prediction markets (`simple-statistics`, `trading-signals`) but 5-10 years behind Python for V2 instruments
- Added `lib/finance/` interface boundary: pure functions for sizing, risk, indicators, portfolio math
- V1: inline TS math. V2: same interfaces swap to `fetch()` calls to a Python quant service
- Documented QStash callback pattern for async Python worker integration
- Added AWS+Terraform as V2 infrastructure option alongside Vercel+sidecar

### Files Modified
- `saas/docs/VISION.md` — complete rewrite (playbooks, strategies, risk controls, retail positioning)
- `saas/docs/ARCH.md` — complete rewrite (portfolio model, playbook system, risk engine, DB schema, tools, Compute & Finance section, updated ADRs)
- `saas/docs/PLAN.md` — complete rewrite (6 phases, removed time targets and checkboxes, Phase 2 = Portfolio & Strategies)
- `saas/docs/TAXONOMY.md` — complete rewrite (new terminology, 6 playbooks, strategy states, risk controls, updated tool names)

### Commits (branch: `ph3`)
- `f2ca4e2` — Redesign product model: 6 playbooks, Account→Strategy→Trade, two-layer risk engine
- `6e71050` — Rename Theme→Strategy and Archetype→Playbook across all docs
- `7998c1d` — TAXONOMY update with new terminology
- `8526ee1` — Add Compute & Finance section: lib/finance/ interfaces, V2 Python path, AWS+Terraform option

### Decisions
- **6 Playbooks over 4 ad-hoc strategies** — grounded in established finance (event-driven, relative value, tail risk, momentum, mean reversion, macro thematic)
- **Strategy + Playbook naming** — "Strategy" is what users naturally say; "Playbook" is clear and non-jargony
- **V1 TS finance math is sufficient** — binary contracts (pay $1 or $0) only need Kelly, drawdown, basic stats. No QuantLib needed.
- **`lib/finance/` interface boundary** — pure functions with no awareness of implementation. V2 swaps bodies to HTTP calls. No app code changes.
- **AWS+Terraform as V2 option** — don't decide now, ship V1 on Vercel, evaluate after traction
- **Multi-instrument architecture ready but not implemented** — `instrumentType` enum on Strategy, `exchange` on Trade/Position. V1 = `prediction_market` only.


---

## 2026-03-03 — Phase 2.1: Strategy Schema & CRUD

**Phase:** 2.1 (Strategy Schema & CRUD)


### Changes

**Playbook Config Schemas** (`lib/ai/strategies/playbook-schemas.ts`)
- 6 Zod schemas: base config (filters, entryRules, exitRules, sizing, research, thesisTemplate) + playbook-specific extensions
- `validateStrategyConfig()` — validates config JSON against the appropriate playbook schema
- `getDefaultConfig()` — returns fully populated defaults for a playbook
- Exports: `PLAYBOOK_VALUES`, `INSTRUMENT_TYPE_VALUES`, `STRATEGY_STATUS_VALUES` enums

**Database Schema & Migration**
- Added `Strategy` table to `lib/db/schema.ts` (id, userId FK, name, playbook enum, instrumentType enum, budgetCents, config JSON, status enum, timestamps)
- Added `strategyId` nullable FK on `Trade` table (backward-compatible with Phase 1 trades)
- Added 5 account-level risk fields to `User` table (allocatedCapitalCents, maxExposurePct, dailyLossLimitCents, drawdownPausePct, maxCorrelatedTrades)
- Migration: `0012_oval_george_stacy.sql`

**Query Functions** (`lib/db/queries.ts`)
- `getStrategiesByUserId` — with optional status filter
- `getStrategyById` — scoped to userId
- `createStrategy` — with config JSON
- `updateStrategy` — partial updates with updatedAt bump
- `getActiveStrategiesByUserId` — convenience wrapper
- `getStrategyTradeStats` — open trade counts grouped by strategyId

**AI Tools**
- `listStrategies` — enriches strategies with trade stats (open position counts)
- `createStrategy` — merges user config with playbook defaults, validates, creates
- `updateStrategy` — fetches existing, merges config, validates, updates
- All 3 registered in route.ts (tools, activeTools), tool-wrapper.ts (TOOL_CONFIG), types.ts (ChatTools)

**Session Context & Prompt**
- Chat route fetches active strategies in parallel with open trades
- System prompt updated: 6 playbooks described, strategy management guidance, old strategy names removed

**Tests**
- `lib/ai/strategies/__tests__/playbook-schemas.test.ts` — 17 tests (enums, schemas, validation, defaults)
- `lib/ai/tools/__tests__/list-strategies.test.ts` — 5 tests (enrichment, filtering, empty state, errors)
- `lib/ai/tools/__tests__/create-strategy.test.ts` — 5 tests (default merging, validation, playbook-specific config, errors)
- `lib/ai/tools/__tests__/update-strategy.test.ts` — 9 tests (name/budget/status/config updates, not-found, no-fields, invalid config, errors)
- Full suite: 132/132 tests passing

### Files Created
- `lib/ai/strategies/playbook-schemas.ts`
- `lib/ai/tools/list-strategies.ts`
- `lib/ai/tools/create-strategy.ts`
- `lib/ai/tools/update-strategy.ts`
- `lib/ai/strategies/__tests__/playbook-schemas.test.ts`
- `lib/ai/tools/__tests__/list-strategies.test.ts`
- `lib/ai/tools/__tests__/create-strategy.test.ts`
- `lib/ai/tools/__tests__/update-strategy.test.ts`
- `lib/db/migrations/0012_oval_george_stacy.sql`

### Files Modified
- `lib/db/schema.ts` — Strategy table, Trade FK, User risk fields
- `lib/db/queries.ts` — 6 new query functions
- `lib/ai/prompts.ts` — system prompt updated with playbooks
- `lib/ai/tool-wrapper.ts` — 3 TOOL_CONFIG entries
- `lib/types.ts` — 3 new tool type exports
- `app/(chat)/api/chat/route.ts` — tool registration, strategy context

### Decisions
- `strategyId` on Trade is nullable FK — backward-compatible with Phase 1 trades that have no strategy
- Old `strategy` text column on Trade preserved (no data migration needed, will be deprecated later)
- Config validation uses merge-then-validate: user partial config + playbook defaults → validate against schema
- Tool tests mock DB queries at module level (consistent with existing test patterns); no standalone query tests (queries tested indirectly through tool tests)

