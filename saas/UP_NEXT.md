# UP_NEXT.md

## Active Phase

**Phase 1: Trading Core** — mostly complete (see gaps below)

## What Was Completed

### Phase 0.4 — Cleanup (session 2026-02-28)
- Removed weather tool, Pyodide runtime, "Deploy with Vercel" branding
- Applied Operator trading agent persona to system prompt
- Updated app title, meta tags, suggested actions, sidebar branding
- Commit: `04c20b1`

### Phase 1.1 — Kalshi API Client (session 2026-02-28)
- `lib/kalshi/client.ts` — RSA-PSS signed REST client, all methods
- `lib/kalshi/encrypt.ts` — AES-256-GCM credential encryption
- `lib/kalshi/index.ts` — barrel + `getKalshiClientForUser()` helper
- `lib/kalshi/types.ts` — full Kalshi API v2 type definitions
- KalshiCredential table + migration
- Commit: `a780cf5`

### Phase 1.2 — Kalshi Onboarding Flow (session 2026-02-28)
- `/api/kalshi/credentials` route (GET/POST/DELETE)
- `/settings` page + `KalshiConnectionForm` component
- Settings link in sidebar user nav
- Commit: `c17ded6`

### Phase 1.3 — Trading Tools (session 2026-02-28)
- `getMarkets`, `getPositions`, `createOrder`, `cancelOrder` AI tools
- All wired into chat route + ChatTools type
- Commit: `7f0a68b`

### Phase 1.4 — Research Tools (session 2026-02-28)
- `webSearch` (Tavily) and `xSearch` (X API v2) tools
- Commit: `7f0a68b` (same commit as 1.3)

### Phase 1.5 — Trading State (partial, session 2026-02-28)
- Trade table + migration (`0010_lucky_doctor_faustus.sql`)
- `logTrade`, `getOpenTradesByUserId`, `getRecentTradesByUserId`, `closeTradeByOrderId`, `cancelTradeByOrderId` queries
- `createOrder` auto-logs trade; `cancelOrder` marks cancelled
- Commit: `f46581c`

### Phase 1.6 — Session Context (session 2026-02-28)
- Open trades injected into system prompt on each chat turn
- `systemPrompt` accepts optional `sessionContext` param
- Commit: `f46581c` (same commit as 1.5)

---

## Outstanding / Not Done

### Phase 0 Infrastructure (blocked on user setup)
These require creating external services — code cannot substitute:
- **0.1** — Vercel project creation, repo connection, custom domain
- **0.2** — Supabase project, pooled connection string, run migrations
- **0.3** — Upstash Redis, Google OAuth provider in NextAuth, remove guest user

### Phase 1 Gaps (code work remaining)
Per Phase 1 exit criteria in PLAN.md:
- **1.5 (incomplete)** — Position, Recommendation, Scan tables not created (only Trade was done)
- **1.5 (incomplete)** — `getPortfolio` tool (live prices + unrealized P&L) not implemented
- **1.5 (incomplete)** — `getTradeHistory` tool not implemented
- **1.3 (partial)** — Trade confirmation UI exists via `needsApproval: true`, but no dedicated confirm/reject UI component built in the frontend

### Phase 1 Exit Criteria Status
- [x] User can connect Kalshi account via settings
- [x] User can ask "what's on Kalshi?" and get market data
- [x] User can ask agent to research a thesis (web + X search)
- [x] User can approve and execute trades via chat
- [ ] Trades are logged and positions tracked across sessions — partial (Trade table only)
- [ ] User can ask "how are my positions?" and get live P&L — `getPortfolio` not built

---

## Immediate Next Task

**Option A (recommended): Finish Phase 1 gaps**
1. Add `getPortfolio` AI tool — calls Kalshi for live position prices, computes unrealized P&L
2. Add `getTradeHistory` AI tool — queries Trade table, shows history with status
3. Decide if Position/Recommendation/Scan tables are needed or if Trade table covers it

**Option B: Infra (Phase 0.1–0.3)**
Required before production, but can be done in parallel with code work. User must do this.
1. Create Vercel project + connect `operator-auteng-ai/trading` repo
2. Create Supabase project, set `POSTGRES_URL`, run migrations
3. Create Upstash Redis, add `REDIS_URL`, add Google OAuth, remove guest auto-create

**Recommendation:** Finish Phase 1 code gaps first (Option A), then infra (Option B) — gives a clean Phase 1 exit before deploying.

## Blockers

- None for code work
- Phase 0.1–0.3 infra requires user to create/configure external services

## Decisions Needed

- Are Position, Recommendation, Scan tables needed separately, or does Trade + Kalshi live data cover the use cases for Phase 1?
- For `getPortfolio`: fetch live prices from Kalshi per-position (accurate but slow) or use cached Trade table prices (fast but stale)?
