# Implementation Plan

> Phased build plan for the Kalshi Trading Agent SaaS.
> References: [VISION.md](VISION.md) (what), [ARCH.md](ARCH.md) (how), [INFRASTRUCTURE.md](INFRASTRUCTURE.md) (where).

---

## Phases Overview

| Phase | Name | Duration | Outcome |
|-------|------|----------|---------|
| 0 | Foundation | 1 week | Fork deployed on Vercel, DB on Supabase, working chat |
| 1 | Trading Core | 2 weeks | Users can research and trade on Kalshi via chat |
| 2 | Strategy Engine | 1 week | Users can create, save, and run custom strategies |
| 3 | Billing | 1 week | Stripe subscriptions, trials, tier gating |
| 4 | Scheduled Ops | 1 week | Cron position checks, QStash fan-out, email alerts |
| 5 | Polish & Launch | 1 week | Onboarding, landing page, error handling, soft launch |

**Total: ~7 weeks to MVP launch**

---

## Phase 0: Foundation

> Goal: The Vercel chatbot fork runs on our infra with our database. Chat works end-to-end.

### 0.1 — Fork and Deploy

- [ ] Fork `vercel/chatbot` to our repo
- [ ] Create Vercel project, connect repo
- [ ] Verify build succeeds and preview deployment works
- [ ] Set up custom domain

### 0.2 — Swap Database to Supabase

- [ ] Create Supabase project (us-east-1)
- [ ] Get pooled connection string
- [ ] Update `POSTGRES_URL` env var in Vercel
- [ ] Run existing chatbot migrations against Supabase
- [ ] Verify chat, messages, documents all work on Supabase

### 0.3 — Redis + Auth

- [ ] Create Upstash Redis instance
- [ ] Set `REDIS_URL` in Vercel
- [ ] Verify stream resumability works
- [ ] Add Google OAuth provider to NextAuth config
- [ ] Remove guest user auto-creation (we want real accounts only)
- [ ] Test signup → login → chat flow

### 0.4 — Cleanup

- [ ] Remove chatbot features we don't need (weather tool, Pyodide Python runtime)
- [ ] Update system prompt to trading agent persona
- [ ] Update branding (app name, favicon, meta tags)

### Exit Criteria
- Chat works on our domain with Supabase + Upstash
- Users can sign up with Google OAuth and chat with AI
- No references to "Vercel chatbot" in UI

---

## Phase 1: Trading Core

> Goal: Users can connect their Kalshi account, research markets, and place trades via chat.

### 1.1 — Kalshi API Client

- [ ] Build Kalshi REST client (`lib/kalshi/client.ts`)
  - Authentication (API key + private key signing)
  - Market data: events, markets, orderbook
  - Trading: create order, cancel order, get orders
  - Account: balance, positions, fills
- [ ] Add credential encryption/decryption utilities
- [ ] Create KalshiCredential table (Drizzle migration)

### 1.2 — Kalshi Onboarding Flow

- [ ] Build settings page for Kalshi API key input
  - User pastes API key + private key
  - Encrypt and store in KalshiCredential table
  - Test connection (fetch balance) before saving
- [ ] Show connection status in sidebar

### 1.3 — Trading Tools

- [ ] Implement AI SDK tools:
  - `getMarkets` — scan events, filter markets, return structured data
  - `getPositions` — user's balance, open positions, resting orders
  - `createOrder` — place limit order (requires user confirmation)
  - `cancelOrder` — cancel resting order (requires user confirmation)
- [ ] Add confirmation UI for trade execution (user must click confirm before order fires)
- [ ] Update system prompt with trading instructions and risk disclaimers

### 1.4 — Research Tools

- [ ] Implement `webSearch` tool — web search for catalyst research
- [ ] Implement `xSearch` tool — X/Twitter API for real-time sentiment
- [ ] Add research source attribution in chat responses

### 1.5 — Trading State

- [ ] Create trading tables (Drizzle migrations):
  - Trade, Position, Recommendation, Scan
- [ ] Write query functions for trade logging, position tracking
- [ ] Auto-log trades when `createOrder` tool executes successfully
- [ ] Implement `getPortfolio` tool — pulls positions + current prices + P&L
- [ ] Implement `getTradeHistory` tool — past trades with outcomes

### 1.6 — Session Context

- [ ] On each new chat turn, inject user's current state into system prompt:
  - Open positions with current prices
  - Account balance
  - Active strategies
  - Recent trade history
- [ ] This gives the agent "memory" across sessions without explicit user prompting

### Exit Criteria
- User can connect Kalshi account via settings
- User can ask "what's on Kalshi?" and get market data
- User can ask agent to research a thesis (web + X search)
- User can approve and execute trades via chat
- Trades are logged and positions tracked across sessions
- User can ask "how are my positions?" and get live P&L

---

## Phase 2: Strategy Engine

> Goal: Users can create, save, edit, and run custom trading strategies.

### 2.1 — Strategy Schema

- [ ] Create Strategy table (Drizzle migration)
- [ ] Define JSON schema for strategy configs:
  - `filters` — keywords, event types, price range
  - `entry_rules` — max entry price, min volume, min edge
  - `exit_rules` — target price, stop loss, time-based exit
  - `sizing` — max per trade, Kelly fraction, portfolio cap
  - `research` — search query templates, source priority
  - `thesis_template` — required documentation fields
- [ ] Validate strategy configs on save

### 2.2 — Strategy Tools

- [ ] Implement AI SDK tools:
  - `listStrategies` — user's saved strategies
  - `saveStrategy` — create or update a strategy config (AI structures natural language into JSON)
  - `runStrategy` — execute a strategy's full scan/research/recommend pipeline
- [ ] Built-in strategy templates (oil, fat-tails, volatility-swing, spread-arb) as seed data for new users

### 2.3 — Strategy Execution Pipeline

- [ ] When `runStrategy` is called:
  1. Load strategy config from DB
  2. Filter Kalshi events/markets against strategy filters
  3. Run research (web + X search) using strategy's query templates
  4. Apply entry rules to rank candidates
  5. Calculate position sizing per strategy config
  6. Present recommendations with thesis, edge, confidence
  7. Wait for user to approve trades
- [ ] Log scan results to Scan table
- [ ] Log recommendations to Recommendation table
- [ ] Update recommendation status when user trades or skips

### 2.4 — Strategy Performance

- [ ] Track per-strategy stats:
  - Total trades, wins, losses
  - Realized P&L
  - Win rate
  - Average edge at entry
- [ ] Surface via `getPortfolio` tool when strategy context is relevant

### Exit Criteria
- User can say "create a strategy for tech regulation" and get a structured config saved
- User can say "run my tech regulation strategy" and get filtered recommendations
- User can list, edit, and delete strategies
- Per-strategy performance tracked and reportable

---

## Phase 3: Billing

> Goal: Stripe subscriptions with 7-day trial, tier gating, self-service portal.

### 3.1 — Stripe Setup

- [ ] Create Stripe products and prices:
  - Standard: $100/mo with 7-day trial
  - Premium: $500/mo with 7-day trial
- [ ] Configure Stripe Customer Portal (payment methods, invoices, cancellation)

### 3.2 — Checkout Flow

- [ ] Add billing page / upgrade prompt
- [ ] Implement Stripe Checkout session creation (server action)
- [ ] Redirect to Stripe Checkout with trial period
- [ ] Handle success/cancel redirects

### 3.3 — Webhook Handler

- [ ] Create `/api/webhooks/stripe` route
- [ ] Handle events:
  - `checkout.session.completed` → set user tier, store stripeCustomerId
  - `invoice.payment_succeeded` → confirm subscription active
  - `invoice.payment_failed` → set grace period, send email
  - `customer.subscription.updated` → handle plan changes
  - `customer.subscription.deleted` → suspend account
- [ ] Verify webhook signatures

### 3.4 — Tier Gating

- [ ] Extend User table with tier, stripeCustomerId, stripeSubscriptionId, trialEndsAt
- [ ] Add middleware check: unauthenticated or suspended → redirect to signup/billing
- [ ] Gate trading tools behind active subscription (trial or paid)
- [ ] Gate Premium features (hourly cron) behind Premium tier
- [ ] Show current plan + usage in settings page

### 3.5 — Trial Flow

- [ ] New signups start with 7-day trial (Standard access)
- [ ] Trial countdown visible in UI
- [ ] Send "trial ending in 2 days" email via Resend
- [ ] After trial: if no payment method → suspend, prompt upgrade
- [ ] After trial: if payment method on file → charge automatically

### Exit Criteria
- New user signs up → sees trial banner → full Standard access for 7 days
- Credit card collected upfront via Stripe Checkout
- After trial: auto-charges or suspends
- User can upgrade Standard → Premium via Stripe portal
- Suspended users see upgrade prompt, cannot trade

---

## Phase 4: Scheduled Operations

> Goal: Automated position monitoring, opportunity scanning, and email alerts.

### 4.1 — Cron Infrastructure

- [ ] Create Upstash QStash instance
- [ ] Add `QSTASH_TOKEN`, signing keys to Vercel env vars
- [ ] Create `/api/jobs/dispatch` route
  - Verify `CRON_SECRET` header
  - Accept `tier` query param (standard | premium)
  - Query users with open positions for that tier
- [ ] Add cron config to `vercel.json`
- [ ] Deploy and verify cron fires on schedule

### 4.2 — Batch Position Checks (No AI)

- [ ] In dispatch route:
  - Collect all unique tickers across all users' positions
  - Single batch call to Kalshi API for current prices
  - Update `currentPriceCents` on each position
  - Check thresholds: price crossed target or stop loss
  - Fire alerts for threshold crossings
- [ ] Create Alert table (Drizzle migration)
- [ ] Log all alerts to DB

### 4.3 — QStash Fan-Out (AI Scans)

- [ ] For Premium users with active strategies:
  - Publish QStash message per user/strategy to `/api/jobs/scan-user/[userId]`
- [ ] Create `/api/jobs/scan-user/[userId]` route:
  - Verify QStash signature
  - Load user's strategy config
  - Run strategy scan pipeline (same as `runStrategy` but headless)
  - Store scan results and recommendations in DB
  - Send email if actionable opportunities found
- [ ] Add retry handling (QStash auto-retries 3x)

### 4.4 — Email Alerts

- [ ] Set up Resend with verified domain
- [ ] Build email templates:
  - Position alert (price threshold crossed)
  - Opportunity found (strategy scan match)
  - Daily digest (end-of-day summary, opt-in)
- [ ] Create `/api/jobs/daily-snapshot` route:
  - Calculate realized + unrealized P&L per user
  - Store PerformanceSnapshot
  - Send daily digest email (if opted in)

### 4.5 — In-App Alerts

- [ ] Show alert badge in sidebar
- [ ] Alert history page or panel
- [ ] Mark alerts as read
- [ ] Show latest alerts on chat load (injected into system prompt context)

### Exit Criteria
- Cron fires reliably on schedule (verified via Vercel logs)
- Standard users get 5x/day position price updates
- Premium users get hourly checks + strategy scans via QStash
- Email alerts delivered for threshold crossings and opportunities
- Daily snapshot records P&L history
- In-app alert indicator visible

---

## Phase 5: Polish & Launch

> Goal: Production-ready experience, onboarding, landing page, soft launch.

### 5.1 — Onboarding

- [ ] First-login flow:
  1. Welcome screen explaining the product
  2. Connect Kalshi account (API key setup)
  3. Choose or create first strategy
  4. Guided first trade (suggested market, small size)
- [ ] Tooltips / help text for key actions
- [ ] Regulatory disclaimers (not financial advice, risk warnings)

### 5.2 — Landing Page

- [ ] Public landing page (unauthenticated):
  - Value proposition
  - How it works (3-step visual)
  - Pricing table (Standard / Premium)
  - "Start free trial" CTA → signup
- [ ] SEO basics (meta tags, OpenGraph, sitemap)

### 5.3 — Error Handling

- [ ] Graceful handling for:
  - Kalshi API errors (rate limit, invalid credentials, market closed)
  - AI provider errors (timeout, rate limit, content filter)
  - Stripe webhook failures (retry logic)
  - QStash delivery failures (dead letter logging)
- [ ] User-friendly error messages in chat (not stack traces)
- [ ] Error reporting to Vercel logs with context

### 5.4 — Security Review

- [ ] Verify Kalshi credentials encrypted at rest, decrypted only in-request
- [ ] Verify no credentials in client-side code or logs
- [ ] Verify Stripe webhook signature validation
- [ ] Verify QStash signature validation
- [ ] Verify CRON_SECRET enforcement on all job routes
- [ ] Verify trade confirmation UI cannot be bypassed
- [ ] Rate limiting on auth routes (prevent brute force)

### 5.5 — Testing

- [ ] Extend Playwright E2E tests (inherited from chatbot):
  - Signup → connect Kalshi → chat → trade → verify position logged
  - Strategy create → run → recommendations displayed
  - Billing flow: trial → upgrade → downgrade → cancel
- [ ] Manual testing:
  - Full trade lifecycle on Kalshi staging/paper trading
  - Cron job execution and alert delivery
  - Edge cases: expired markets, cancelled orders, API downtime

### 5.6 — Soft Launch

- [ ] Deploy to production domain
- [ ] Invite 5-10 beta users (manual, by email)
- [ ] Monitor logs, costs, error rates for 1 week
- [ ] Collect feedback, iterate
- [ ] Open signups

### Exit Criteria
- New user can go from landing page → signup → trial → first trade in <10 minutes
- All error states handled gracefully
- Security review passed
- E2E tests passing in CI
- 5+ beta users actively trading
- Costs tracking within estimates

---

## Dependencies Between Phases

```
Phase 0 (Foundation)
  └──→ Phase 1 (Trading Core)
         ├──→ Phase 2 (Strategy Engine)
         └──→ Phase 3 (Billing)
                └──→ Phase 4 (Scheduled Ops) [needs tier gating]
                       └──→ Phase 5 (Polish & Launch)
```

- Phase 2 and 3 can run in parallel after Phase 1
- Phase 4 depends on Phase 3 (tier determines cron frequency)
- Phase 5 is the integration/polish pass after everything works

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Kalshi API changes or rate limits us | Medium | High | Build client with retry/backoff, cache market data, contact Kalshi for partnership |
| AI costs exceed revenue per user | Low | Medium | Monitor per-user token usage, model routing (cheap models for simple tasks), usage caps as last resort |
| Vercel 60s function timeout on complex scans | Medium | Medium | Split long operations into multiple tool calls, move to Vercel Pro 300s if needed |
| Stripe webhook delivery issues | Low | High | Idempotent handlers, manual reconciliation tool, Stripe retry policy |
| Users attempt market manipulation via agent | Low | High | Disclaimers, trade logging, position size limits, content moderation review |
| Low trial conversion | Medium | Medium | Optimize onboarding, guided first trade, follow-up emails |
| Competitor launches similar product | Medium | Low | First-mover advantage, strategy engine differentiation, community building |

---

## Post-Launch Roadmap (V2+)

Not in scope for MVP, but planned:

- **Strategy marketplace** — users share/sell strategy configs
- **Portfolio analytics dashboard** — visual P&L charts, strategy comparison
- **Mobile PWA** — responsive web app installable on phone
- **Multi-exchange** — Polymarket, PredictIt integration
- **Automated monitoring trades** — Premium feature: agent can execute pre-approved small trades on opportunities (with strict limits)
- **API access** — REST API for programmatic strategy execution
- **Team features** — shared portfolios, role-based access, audit log
