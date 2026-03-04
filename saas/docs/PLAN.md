# Implementation Plan

> Phased build plan for the SaaS trading platform.
> References: [VISION.md](VISION.md) (what), [ARCH.md](ARCH.md) (how), [INFRASTRUCTURE.md](INFRASTRUCTURE.md) (where).

---

## Phases Overview

| Phase | Name | Outcome |
|-------|------|---------|
| 0 | Foundation | Fork deployed on Vercel, DB on Supabase, working chat |
| 1 | Trading Core | Users can research and trade on Kalshi via chat |
| 2 | Portfolio & Strategies | Account → Strategy → Trade model, 6 playbooks, risk engine |
| 3 | Billing | Stripe subscriptions, trials, tier gating |
| 4 | Scheduled Ops | Cron position checks, QStash fan-out, email alerts |
| 5 | Polish & Launch | Onboarding, landing page, error handling, soft launch |

---

## Phase 0: Foundation

> Goal: The Vercel chatbot fork runs on our infra with our database. Chat works end-to-end.

### 0.1 — Fork and Deploy

- Fork `vercel/chatbot` to our repo
- Create Vercel project, connect repo
- Verify build succeeds and preview deployment works
- Set up custom domain

### 0.2 — Swap Database to Supabase

- Create Supabase project (us-east-1)
- Get pooled connection string
- Update `POSTGRES_URL` env var in Vercel
- Run existing chatbot migrations against Supabase
- Verify chat, messages, documents all work on Supabase

### 0.3 — Redis + Auth

- Create Upstash Redis instance
- Set `REDIS_URL` in Vercel
- Verify stream resumability works
- Add Google OAuth provider to NextAuth config
- Remove guest user auto-creation (we want real accounts only)
- Test signup → login → chat flow

### 0.4 — Cleanup

- Remove chatbot features we don't need (weather tool, Pyodide Python runtime)
- Update system prompt to trading agent persona
- Update branding (app name, favicon, meta tags)

### Exit Criteria
- Chat works on our domain with Supabase + Upstash
- Users can sign up with Google OAuth and chat with AI
- No references to "Vercel chatbot" in UI

---

## Phase 1: Trading Core

> Goal: Users can connect their Kalshi account, research markets, and place trades via chat. No strategies yet — trades are standalone. This builds the exchange integration layer that Phase 2 wraps with the portfolio model.

### 1.1 — Exchange Integration Layer

- Build Kalshi REST client (`lib/exchanges/kalshi/client.ts`)
  - Authentication (API key + private key signing)
  - Market data: events, markets, orderbook
  - Trading: create order, cancel order, get orders
  - Account: balance, positions, fills
- Define exchange interface (`lib/exchanges/types.ts`) — V2 exchanges will implement same interface
- Add credential encryption/decryption utilities
- Create ExchangeCredential table (Drizzle migration) with `exchange` enum field

### 1.2 — Exchange Onboarding Flow

- Build settings page for Kalshi API key input
  - User pastes API key + private key
  - Encrypt and store in ExchangeCredential table
  - Test connection (fetch balance) before saving
- Show connection status in sidebar

### 1.3 — Trading Tools (Standalone)

- Implement AI SDK tools:
  - `scanMarkets` — query events, filter markets, return structured data
  - `getPositions` — user's balance, open positions, resting orders
  - `createOrder` — place limit order (requires user confirmation)
  - `cancelOrder` — cancel resting order (requires user confirmation)
- Add confirmation UI for trade execution (user must click confirm before order fires)
- Update system prompt with trading instructions and risk disclaimers

### 1.4 — Research Tools

- Implement `webSearch` tool — web search for catalyst research
- Implement `xSearch` tool — X/Twitter API for real-time sentiment
- Add research source attribution in chat responses

### 1.5 — Basic Trade State

- Create Trade and Position tables (Drizzle migrations)
  - Include `strategyId` FK as nullable (Phase 1 trades have no strategy)
  - Include `thesis` and `exitRules` fields
- Write query functions for trade logging, position tracking
- Auto-log trades when `createOrder` executes successfully
- Implement `getPortfolio` tool — balance + open positions + P&L
- Implement `getTradeHistory` tool — past trades with outcomes

### 1.6 — Session Context

- On each new chat turn, inject user's current state into system prompt:
  - Open positions with current prices
  - Account balance
  - Recent trade history
- This gives the agent "memory" across sessions

### Exit Criteria
- User can connect Kalshi account via settings
- User can ask "what's on Kalshi?" and get market data
- User can ask agent to research a thesis (web + X search)
- User can approve and execute trades via chat
- Trades are logged and positions tracked across sessions
- User can ask "how are my positions?" and get live P&L

---

## Phase 2: Portfolio & Strategies

> Goal: The Account → Strategy → Trade portfolio model. Users create strategy buckets, each using one of 6 playbooks. Risk engine enforces strategy and account-level controls.

### 2.1 — Strategy Schema & CRUD

- Create Strategy table (Drizzle migration)
  - `playbook` enum: event_driven, relative_value, tail_risk, momentum, mean_reversion, macro_thematic
  - `instrumentType` enum: prediction_market (V1 only value), options, crypto
  - `budgetCents`, `status` (active/paused/archived)
  - `config` JSON (playbook-specific: filters, entry/exit rules, sizing, research, thesis_template)
- Add `strategyId` FK to Recommendation, Scan tables
- Implement AI SDK tools:
  - `listStrategies` — user's strategies with status, budget, open positions, P&L
  - `createStrategy` — AI structures natural language into strategy config using playbook schema
  - `updateStrategy` — modify config, budget, status
- Validate strategy configs on save against playbook-specific JSON schema
- Backfill: associate any Phase 1 standalone trades with a default "Uncategorized" bucket

### 2.2 — Playbook Engine

- Define playbook pipeline interface:
  ```
  scan(strategyConfig, exchangeClient) → candidates[]
  research(candidates[], searchTools) → enrichedCandidates[]
  rank(enrichedCandidates[], strategyConfig) → scoredCandidates[]
  size(scoredCandidates[], strategyConfig, strategyBudgetRemaining) → recommendations[]
  ```
- Implement all 6 playbook pipelines for `prediction_market` instrument type:
  - **Event-Driven**: scan for imminent catalysts, research outcomes, edge-based Kelly sizing
  - **Relative Value**: scan for related markets, check mathematical consistency, per-leg sizing
  - **Tail Risk**: scan for ≤3¢ contracts, score by catalyst plausibility + base rate, portfolio sizing
  - **Momentum**: detect price drift + volume patterns, correlate with news, trend-strength sizing
  - **Mean Reversion**: detect sharp moves (>15pts/24h), verify/debunk catalyst, reversion sizing
  - **Macro Thematic**: map causal chain, find markets at each link, per-link allocation
- Implement `runStrategy` tool — executes the playbook pipeline for a strategy, presents recommendations

### 2.3 — Risk Engine

- Extend User table with account-level risk fields:
  - `allocatedCapitalCents`, `maxExposurePct`, `dailyLossLimitCents`
  - `drawdownPausePct`, `maxCorrelatedTrades`
- Implement strategy-level checks:
  - Budget remaining check
  - Kelly sizing calculation
  - Entry rule validation against strategy config
  - Thesis requirement enforcement
- Implement account-level checks:
  - Total exposure cap
  - Correlation check (trades on same underlying across strategies)
  - Daily loss limit
  - Drawdown pause
- Wire risk engine into `createOrder` tool — every trade passes through before reaching exchange
- Implement `getRiskStatus` tool — account risk dashboard

### 2.4 — Strategy Performance

- Track per-strategy stats:
  - Total trades, wins, losses
  - Realized P&L, unrealized P&L
  - Win rate
  - Average edge at entry
- Track per-playbook stats (aggregated across strategies using same playbook)
- Extend `getPortfolio` to show per-strategy breakdown
- Create PerformanceSnapshot table with `perStrategyBreakdown` JSON field

### 2.5 — Account Setup Flow

- Add account setup step after Kalshi connection:
  - "How much capital do you want to allocate to AI trading?"
  - Set risk preferences (or accept sensible defaults)
  - AI suggests first strategies based on user interests
- Sensible defaults for risk controls:
  - Max exposure: 60% of allocated capital
  - Daily loss limit: 10% of allocated capital
  - Drawdown pause: 20%
  - Max correlated trades: 3

### Exit Criteria
- User can say "create a strategy for tech regulation events" → structured strategy saved
- User can say "run my tech regulation strategy" → playbook pipeline executes, recommendations shown
- User can have 5+ strategies with different playbooks, each with their own budget
- Risk engine blocks trades that violate strategy or account limits (with explanation)
- User can say "show my portfolio" → per-strategy and account-wide P&L
- Per-strategy performance tracked and reportable

---

## Phase 3: Billing

> Goal: Stripe subscriptions with 7-day trial, tier gating, self-service portal.

### 3.1 — Stripe Setup

- Create Stripe products and prices:
  - Standard: $100/mo with 7-day trial
  - Premium: $500/mo with 7-day trial
- Configure Stripe Customer Portal (payment methods, invoices, cancellation)

### 3.2 — Checkout Flow

- Add billing page / upgrade prompt
- Implement Stripe Checkout session creation (server action)
- Redirect to Stripe Checkout with trial period
- Handle success/cancel redirects

### 3.3 — Webhook Handler

- Create `/api/webhooks/stripe` route
- Handle events:
  - `checkout.session.completed` → set user tier, store stripeCustomerId
  - `invoice.payment_succeeded` → confirm subscription active
  - `invoice.payment_failed` → set grace period, send email
  - `customer.subscription.updated` → handle plan changes
  - `customer.subscription.deleted` → suspend account
- Verify webhook signatures

### 3.4 — Tier Gating

- Add middleware check: unauthenticated or suspended → redirect to signup/billing
- Gate trading tools behind active subscription (trial or paid)
- Gate Premium features (hourly cron) behind Premium tier
- Show current plan + usage in settings page

### 3.5 — Trial Flow

- New signups start with 7-day trial (Standard access)
- Trial countdown visible in UI
- Send "trial ending in 2 days" email via Resend
- After trial: if no payment method → suspend, prompt upgrade
- After trial: if payment method on file → charge automatically

### Exit Criteria
- New user signs up → sees trial banner → full Standard access for 7 days
- Credit card collected upfront via Stripe Checkout
- After trial: auto-charges or suspends
- User can upgrade Standard → Premium via Stripe portal
- Suspended users see upgrade prompt, cannot trade

---

## Phase 4: Scheduled Operations

> Goal: Automated position monitoring, strategy scanning, and alerts.

### 4.1 — Cron Infrastructure

- Create Upstash QStash instance
- Add `QSTASH_TOKEN`, signing keys to Vercel env vars
- Create `/api/jobs/dispatch` route
  - Verify `CRON_SECRET` header
  - Accept `tier` query param (standard | premium)
  - Query users with open positions for that tier
- Add cron config to `vercel.json`
- Deploy and verify cron fires on schedule

### 4.2 — Batch Position Checks (No AI)

- In dispatch route:
  - Collect all unique tickers across all users' positions
  - Single batch call to Kalshi API for current prices
  - Update `currentPriceCents` on each position
  - Run risk engine checks (drawdown, daily loss across strategies)
  - Fire alerts for threshold crossings and risk warnings
- Create Alert table (Drizzle migration) with strategy + risk alert types
- Log all alerts to DB

### 4.3 — QStash Fan-Out (AI Scans)

- For Premium users with active strategies:
  - Publish QStash message per user/strategy to `/api/jobs/scan-user/[userId]`
- Create `/api/jobs/scan-user/[userId]` route:
  - Verify QStash signature
  - Load user's active strategies
  - Run each strategy's playbook pipeline (headless — no user interaction)
  - Store scan results and recommendations in DB
  - Send email if actionable opportunities found
- Add retry handling (QStash auto-retries 3x)

### 4.4 — Email Alerts

- Set up Resend with verified domain
- Build email templates:
  - Position alert (price threshold crossed)
  - Risk alert (drawdown warning, correlation warning)
  - Opportunity found (strategy scan match)
  - Daily digest (end-of-day per-strategy summary, opt-in)
- Create `/api/jobs/daily-snapshot` route:
  - Calculate realized + unrealized P&L per user per strategy
  - Store PerformanceSnapshot with perStrategyBreakdown
  - Send daily digest email (if opted in)

### 4.5 — In-App Alerts

- Show alert badge in sidebar
- Alert history page or panel
- Mark alerts as read
- Show latest alerts on chat load (injected into system prompt context)

### Exit Criteria
- Cron fires reliably on schedule (verified via Vercel logs)
- Standard users get 5x/day position price updates across all strategies
- Premium users get hourly checks + strategy scans via QStash
- Risk engine runs on every cron cycle, fires alerts for drawdown/correlation
- Email alerts delivered for threshold crossings and opportunities
- Daily snapshot records per-strategy P&L history
- In-app alert indicator visible

---

## Phase 5: Polish & Launch

> Goal: Production-ready experience, onboarding, landing page, soft launch.

### 5.1 — Onboarding

- First-login flow:
  1. Welcome screen explaining the product
  2. "How much do you want to allocate to AI trading?" (sets account capital)
  3. Connect Kalshi account (API key setup)
  4. AI suggests 2-3 starter strategies based on user interests
  5. Guided first strategy scan and trade
- Tooltips / help text for key actions
- Regulatory disclaimers (not financial advice, risk warnings)

### 5.2 — Landing Page

- Public landing page (unauthenticated):
  - Value proposition: "Your AI portfolio manager for prediction markets"
  - How it works: Allocate → Choose Strategies → AI Manages
  - Playbooks explainer (the 6 types in plain language)
  - Risk controls as key differentiator
  - Pricing table (Standard / Premium)
  - "Start free trial" CTA → signup
- SEO basics (meta tags, OpenGraph, sitemap)

### 5.3 — Error Handling

- Graceful handling for:
  - Kalshi API errors (rate limit, invalid credentials, market closed)
  - AI provider errors (timeout, rate limit, content filter)
  - Stripe webhook failures (retry logic)
  - QStash delivery failures (dead letter logging)
  - Risk engine blocks (clear explanation of what limit was hit)
- User-friendly error messages in chat (not stack traces)
- Error reporting to Vercel logs with context

### 5.4 — Security Review

- Verify exchange credentials encrypted at rest, decrypted only in-request
- Verify no credentials in client-side code or logs
- Verify Stripe webhook signature validation
- Verify QStash signature validation
- Verify CRON_SECRET enforcement on all job routes
- Verify trade confirmation UI cannot be bypassed
- Verify risk engine cannot be bypassed
- Rate limiting on auth routes (prevent brute force)

### 5.5 — Testing

- Extend Playwright E2E tests:
  - Signup → connect Kalshi → allocate capital → create strategy → scan → trade → verify position
  - Multiple strategies with different playbooks, verify budget isolation
  - Risk engine: attempt trade that violates limit, verify block + explanation
  - Billing flow: trial → upgrade → downgrade → cancel
- Manual testing:
  - Full trade lifecycle on Kalshi staging/paper trading
  - Cron job execution and alert delivery (including risk alerts)
  - Edge cases: expired markets, cancelled orders, API downtime

### 5.6 — Soft Launch

- Deploy to production domain
- Invite 5-10 beta users (manual, by email)
- Monitor logs, costs, error rates
- Collect feedback, iterate
- Open signups

### Exit Criteria
- New user can go from landing page → signup → trial → first strategy → first trade quickly
- All error states handled gracefully
- Security review passed
- E2E tests passing in CI
- 5+ beta users actively trading with multiple strategies
- Costs tracking within estimates

---

## Dependencies Between Phases

```
Phase 0 (Foundation)
  └──→ Phase 1 (Trading Core)
         └──→ Phase 2 (Portfolio & Strategies)
                ├──→ Phase 3 (Billing)
                │      └──→ Phase 4 (Scheduled Ops) [needs tier gating]
                │             └──→ Phase 5 (Polish & Launch)
                └──→ Phase 3 can start after 2.1 (strategy schema) is done
```

- Phase 1 builds the exchange layer that Phase 2 wraps with the portfolio model
- Phase 2 is the biggest phase — the strategy system, 6 playbook pipelines, and risk engine
- Phase 3 can start once the strategy schema is stable (2.1 done)
- Phase 4 depends on Phase 3 (tier determines cron frequency)
- Phase 5 is the integration/polish pass

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Kalshi API changes or rate limits us | Medium | High | Build client with retry/backoff, cache market data, contact Kalshi for partnership |
| AI costs exceed revenue per user | Low | Medium | Monitor per-user token usage, model routing (cheap models for scans), usage caps as last resort |
| Vercel 60s function timeout on playbook pipelines | Medium | Medium | Split pipeline into multiple tool calls, cache intermediate results in Redis |
| 6 playbooks too complex for V1 | Medium | Medium | All 6 playbooks architected in schema; implement event-driven + tail risk + macro thematic first, add others iteratively |
| Risk engine too restrictive (frustrates users) | Low | Medium | Sensible defaults with user-adjustable limits, clear explanations when trades are blocked |
| Stripe webhook delivery issues | Low | High | Idempotent handlers, manual reconciliation tool, Stripe retry policy |
| Users attempt market manipulation via agent | Low | High | Disclaimers, trade logging, position size limits, content moderation review |
| Low trial conversion | Medium | Medium | Optimize onboarding, guided first strategy + trade, follow-up emails |

---

## Post-Launch Roadmap (V2+)

Not in scope for MVP, but planned:

- **Multi-exchange integration** — Tradier (LEAPs/options), Coinbase (crypto), Polymarket
- **Cross-instrument strategies** — a single Macro Thematic strategy trades Kalshi + options + crypto simultaneously
- **Cross-exchange arbitrage** — Kalshi probability vs. options implied vol vs. crypto sentiment
- **Strategy marketplace** — users share/sell strategy configurations
- **Advanced playbooks** — Carry/Income (sell high-probability contracts), Pairs Trading
- **Portfolio analytics dashboard** — visual P&L charts, strategy comparison, attribution analysis
- **Mobile PWA** — responsive web app installable on phone
- **Automated monitoring trades** — Premium feature: agent executes pre-approved small trades (strict limits)
- **API access** — REST API for programmatic strategy management
- **Team features** — shared portfolios, role-based access, audit log
