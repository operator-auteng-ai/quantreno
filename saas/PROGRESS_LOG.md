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
