# SaaS — Product Vision

## One-Liner

An AI-powered trading assistant that researches, analyzes, and executes trades across prediction markets, options, and crypto — delivered as a conversational SaaS. V1 launches with Kalshi; V2+ adds Tradier (LEAPs), Coinbase (crypto), and cross-ecosystem mispricing detection.

---

## The Problem

Prediction markets like Kalshi offer compelling opportunities, but trading them well requires:

1. **Real-time research** — scanning events, reading news, checking X/Twitter, triangulating sources
2. **Strategy discipline** — applying frameworks (oil, fat-tails, volatility-swing, spread-arb) consistently
3. **Position management** — tracking entries, monitoring fills, managing exits across sessions
4. **Macro synthesis** — connecting second and third-order effects (Hormuz closes → oil spikes → CPI rises → Fed frozen)

Today this requires a human expert glued to multiple screens. Our prototype (the Claude-powered system at `~/projects/claude`) proved this entire workflow can be automated by an AI agent with the right tools and memory.

---

## The Product

A web-based chat interface (forked from Vercel's chatbot) where users converse with an AI trading agent that can:

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Market Discovery** | Scan Kalshi events, filter by strategy, surface mispriced contracts |
| **Catalyst Research** | Web search + X/Twitter search to find catalysts and verify theses |
| **Trade Analysis** | Kelly sizing, edge calculation, risk/reward framing |
| **Order Execution** | Place, monitor, and cancel limit orders on Kalshi via API |
| **Position Tracking** | Persistent state across sessions — trades, positions, P&L, win rates |
| **Strategy Routing** | User says "run the oil strategy" and the agent executes the full playbook |
| **Portfolio Monitoring** | Real-time position updates, fill notifications, performance dashboards |

### User Experience

```
User: "Run the oil strategy"

Agent: [Checks balance, scans events, researches catalysts on
        web + X, identifies mispriced CPI contracts, calculates Kelly sizing,
        presents recommendations with thesis/edge/confidence]

User: "Trade the top two, $50 each"

Agent: [Places limit orders, logs to state DB, confirms fills,
        shows updated portfolio]

--- next session ---

User: "How are my positions doing?"

Agent: [Pulls current prices, calculates unrealized P&L, checks
        if any catalysts have changed, recommends hold/exit]

--- custom strategy ---

User: "Create a strategy for tech regulation. I want to track any
       markets related to antitrust, AI regulation, or tech breakups.
       Entry when contracts are under 25 cents, max $20 per trade."

Agent: [Structures into a strategy config: market filters (keywords:
        antitrust, regulation, breakup, AI), entry rules (<25c),
        sizing ($20 cap), research sources (DOJ, FTC, Congress).
        Saves to user's strategy library.]

User: "Run my tech regulation strategy"

Agent: [Executes the saved playbook — scans, filters, researches, recommends]
```

---

## Target Users

### Phase 1: Power Traders (Launch)
- Active Kalshi traders who want AI-augmented research and execution
- Macro traders who understand thesis-driven trading but want faster analysis
- Quant-curious traders who want systematic strategy application

### Phase 2: Informed Beginners (Growth)
- People interested in prediction markets but overwhelmed by research
- News junkies who follow geopolitics/economics and want to trade their views
- Users of other prediction platforms (Polymarket, PredictIt) exploring Kalshi

### Phase 3: Institutional / API (Scale)
- Prop trading desks wanting automated Kalshi coverage
- Research firms needing prediction market intelligence
- Media companies embedding prediction market widgets

---

## Monetization

### Tier Structure

| Tier | Price | Monitoring | Features |
|------|-------|-----------|----------|
| **Standard** | $100/mo | 5 checks/day during market hours | Full trading, custom strategies, state tracking, research, execution |
| **Premium** | $500/mo | Hourly checks (24/7) | Everything in Standard + hourly position monitoring, opportunity scanning, priority alerts |

### Trial & Billing
- **First week free** — full Standard access, credit card required upfront
- **AI token costs included** — we absorb all LLM costs (Claude, GPT, Gemini). Users pay a flat monthly fee, no usage surprises.
- **Billing via Stripe** — monthly subscription, auto-renew, cancel anytime

### Revenue Drivers
- **Subscriptions** — flat monthly fee covers all AI costs
- **Upgrade incentive** — Standard users who want faster monitoring naturally upgrade to Premium
- **Unit economics** — at ~$0.50-2/day AI cost per active user, Standard ($100/mo) has healthy margins. Premium ($500/mo) covers the higher cron + notification costs.

---

## What We're Forking (Vercel Chatbot v3.1)

The Vercel chatbot gives us a production-grade foundation:

| Layer | What We Get | What We Change |
|-------|------------|----------------|
| **Chat UI** | Streaming chat, markdown, code blocks, model selector | Add trading-specific components (order cards, P&L charts, position tables) |
| **Auth** | NextAuth with email/password + guest (fully functional — JWT sessions, bcrypt, middleware route protection) | Keep NextAuth, add OAuth providers (Google, GitHub). No Supabase Auth — we use Drizzle ORM not Supabase client SDK, so RLS integration isn't needed. |
| **AI Integration** | AI SDK with multi-model gateway, 4 built-in tools | Add tool-calling for Kalshi API, web search, X search, strategy engine |
| **Database** | Drizzle ORM → PostgreSQL (Neon), 8 tables, ~20 query functions, migrations | Swap Neon for Supabase Postgres, keep Drizzle ORM, add trading tables (trades, positions, strategies, portfolios) |
| **Artifacts** | Text/code/image/sheet documents | Add "Trade Recommendation" and "Portfolio Dashboard" artifact types |
| **Streaming** | Resumable streams via Redis | Keep, use Upstash Redis (serverless, Vercel-native) |
| **File Storage** | Vercel Blob | Keep Vercel Blob (already integrated, no migration needed) |

---

## What We're Building New

### 1. Kalshi Integration Layer
- Kalshi API client (REST) with auth, order management, market data
- Real-time position sync between Kalshi and our state DB
- Order lifecycle management (placed → resting → filled → settled)

### 2. Trading Strategy Engine
- Strategy definitions as structured configs (JSON schema — not markdown prompts)
- Strategy router that maps user intent to the right playbook
- Pre-built strategies ship as templates: oil, fat-tails, volatility-swing, spread-arb
- **User-defined strategies** — all tiers can create, edit, and save custom strategies via chat
- Strategy CRUD: users describe a strategy in natural language, the agent structures it into a config (market filters, entry/exit rules, sizing parameters, research sources, thesis template)
- Strategy sharing: users can export/import strategy configs (Pro+)
- Strategy performance tracking: per-strategy win rate, P&L, and trade count

### 3. Research Pipeline
- Web search integration (multi-source triangulation)
- X/Twitter API integration for real-time sentiment
- News summarization and catalyst detection
- Source credibility scoring

### 4. State & Portfolio System
- Persistent trade logging across sessions (migrated from SQLite to Supabase)
- Real-time P&L calculation with mark-to-market
- Performance analytics (win rate, Sharpe, strategy comparison)
- Position monitoring with alert triggers

### 5. Billing & Entitlements
- Stripe integration for subscription management
- Usage metering (messages, API calls, model costs)
- Feature gating by tier
- Upgrade/downgrade flows

### 6. Scheduled Operations
- **Position checks** — poll Kalshi for price changes, fill status, new settlements
  - Standard: 5x/day during market hours
  - Premium: every hour, 24/7
- **Opportunity scanning** — scan for new events matching user strategies, flag mispriced contracts
- **Alert notifications** — notify users when positions hit targets, stop losses, or catalysts fire (email + in-app)
- **Daily performance snapshots** — automated end-of-day P&L and portfolio recording

### 7. Admin & Operations
- User management dashboard
- Usage analytics and cost tracking
- Content moderation (prevent market manipulation)
- System health monitoring

---

## Key Principles

1. **AI-First, Not Dashboard-First** — The chat IS the interface. No complex dashboards to learn. Ask the agent, get answers and actions.

2. **Opinionated Strategies, Flexible Execution** — Ship with battle-tested strategies but let users customize. The SOP is the product.

3. **State Across Sessions** — Unlike vanilla chatbots, we remember everything. Your positions, your thesis, your track record. Every session picks up where you left off.

4. **Research Triangulation** — Never trade on a single source. The agent cross-references web search, X/Twitter, market data, and historical patterns before recommending.

5. **Explicit Risk Controls** — Position size caps, portfolio concentration limits, and mandatory thesis documentation. The agent won't YOLO.

6. **Vercel-Native Stack** — Deploy on Vercel (where the chatbot was built to run), Supabase Postgres for data, Upstash Redis for streams, Vercel Blob for files, Vercel Cron for scheduled ops. NextAuth for identity. No AWS in V1.

---

## Success Metrics

| Metric | 3-Month Target | 12-Month Target |
|--------|---------------|-----------------|
| Registered users | 500 | 5,000 |
| Paid subscribers (Standard) | 30 | 300 |
| Paid subscribers (Premium) | 5 | 50 |
| MRR | $5,500 | $55,000 |
| Trades executed | 1,000 | 50,000 |
| Trial → Paid conversion | 20% | 30% |
| Retention (M1) | 40% | 60% |

---

## Competitive Landscape

| Competitor | What They Do | Our Edge |
|-----------|-------------|----------|
| **Kalshi (native)** | Basic trading UI, no AI | We add AI research + strategy + automation |
| **Polymarket** | Crypto-based, no AI tools | Regulated (Kalshi), AI-powered, persistent state |
| **Perplexity / ChatGPT** | General AI, no trading | We execute trades, track positions, apply strategies |
| **Bloomberg Terminal** | Professional trading tools | 1000x cheaper, AI-native, prediction market focus |
| **Tradingview** | Charts + community | We're conversational, not chart-based |

---

## Technical Constraints & Decisions

1. **Kalshi API limits** — Rate limits TBD, may need queuing for high-traffic users
2. **Regulatory** — We do NOT provide financial advice. The agent presents analysis, the user decides. All disclaimers required.
3. **Latency** — Kalshi order execution must be <2s. Research can be async.
4. **Data residency** — User trading data is sensitive. Supabase RLS + encryption at rest.
5. **Model costs** — We absorb all AI token costs. Claude Sonnet ~$3/1M input tokens. Estimated ~$0.50-2/day per active user. At $100/mo Standard, healthy margin. At $500/mo Premium, covers hourly cron + heavier usage.

---

## Non-Goals (V1)

- Mobile app (web-first, responsive)
- Automated trading / bots (user must confirm every trade)
- Multi-exchange support (V1 is Kalshi only — Tradier, Coinbase, and cross-ecosystem mispricings are V2+)
- Social / copy trading (single-user only in V1)
- Custom model fine-tuning
- Real-time price charts (link to exchange UI instead)
