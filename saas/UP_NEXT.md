# UP_NEXT.md

## Active Phase

**Phase 1: Trading Core** — COMPLETE

## What Was Completed

### Phase 0 Infrastructure (2026-03-01)
- Vercel project created + connected to `operator-auteng-ai/trading`
- Supabase project created, migrations run (12 tables)
- Upstash Redis configured
- Google OAuth configured (Google Cloud Console + NextAuth)
- All env vars in Vercel + `.env.local`
- Production deploy live, Google sign-in working
- Redirect loop in `proxy.ts` fixed

### Phase 0.4 — Cleanup (2026-02-28)
- Removed weather tool, Pyodide runtime, "Deploy with Vercel" branding
- Applied Operator trading agent persona to system prompt
- Updated app title, meta tags, suggested actions, sidebar branding

### Phase 1.1 — Kalshi API Client (2026-02-28)
- `lib/kalshi/client.ts` — RSA-PSS signed REST client
- `lib/kalshi/encrypt.ts` — AES-256-GCM credential encryption
- KalshiCredential table + migration

### Phase 1.2 — Kalshi Onboarding Flow (2026-02-28)
- `/api/kalshi/credentials` route (GET/POST/DELETE)
- `/settings` page + `KalshiConnectionForm` component

### Phase 1.3 — Trading Tools (2026-02-28)
- `getMarkets`, `getPositions`, `createOrder`, `cancelOrder` AI tools

### Phase 1.4 — Research Tools (2026-02-28)
- `webSearch` (Tavily) and `xSearch` (X API v2) tools

### Phase 1.5 — Trading State (2026-03-01)
- Trade table + migration
- Auto-log on `createOrder`/`cancelOrder`
- `getPortfolio` tool — live positions from Kalshi + unrealized P&L vs Trade table entry prices
- `getTradeHistory` tool — query Trade table with status filtering and P&L summary

### Phase 1.6 — Session Context (2026-02-28)
- Open trades injected into system prompt on each chat turn

---

## Phase 1 Exit Criteria — All Met
- [x] User can connect Kalshi account via settings
- [x] User can ask "what's on Kalshi?" and get market data
- [x] User can ask agent to research a thesis (web + X search)
- [x] User can approve and execute trades via chat
- [x] Trades are logged and positions tracked
- [x] User can ask "how are my positions?" — `getPortfolio` returns live P&L

---

## Immediate Next Tasks

### Phase 2 — Ready to plan
- See `docs/PLAN.md` for Phase 2 scope
- Likely includes: automated scans (QStash cron), recommendations, multi-exchange support

---

## Blockers

- None

## Decisions Made

- Position/Recommendation/Scan tables **deferred** — Trade table + Kalshi live API covers all Phase 1 use cases
- `getPortfolio` fetches live prices from Kalshi per-position (accurate, not stale)
