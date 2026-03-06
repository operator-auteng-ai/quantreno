# SaaS — Product Vision

## One-Liner

An AI portfolio manager for retail investors — allocate cash, pick strategies, and let AI research, trade, and manage risk across prediction markets, options, and crypto. V1 launches with Kalshi prediction markets; V2+ adds Tradier (LEAPs), Coinbase (crypto), and cross-instrument opportunities.

---

## The Problem

Retail investors who want exposure to prediction markets, options, or crypto face a brutal learning curve:

1. **Research overload** — scanning events, reading news, checking X/Twitter, triangulating sources across dozens of markets
2. **No discipline** — FOMO entries, no exit plan, position sizes based on gut feeling, holding losers too long
3. **No framework** — professionals use established playbooks (event-driven, momentum, relative value). Retail investors trade randomly.
4. **No risk management** — no position sizing, no portfolio-level limits, no correlation awareness, no drawdown rules
5. **No memory** — each trading session starts from scratch. No track record, no performance analysis, no learning from past trades.

Today this requires either a professional background or expensive advisory services. Our prototype (the Claude-powered system at `~/projects/claude`) proved that an AI agent with the right tools, strategies, and memory can serve as a competent portfolio manager for a fraction of the cost.

---

## The Product

A web-based chat interface where users allocate capital to an AI portfolio manager that researches, recommends, and executes trades — with institutional-grade risk controls and strategy discipline.

### The User Experience

```
User: "I have $1,000 to allocate. I'm interested in oil markets
       and anything political."

Agent: [Creates two strategies:
        1. "Oil Supply Chain" (Macro Thematic playbook) — $300 budget
           Tracks Hormuz → oil → CPI → Fed chain
        2. "Political Events" (Event-Driven playbook) — $200 budget
           Upcoming elections, hearings, policy decisions
        Sets $500 unallocated as reserve.
        Explains each strategy and why the sizing.]

User: "Run my oil strategy"

Agent: [Scans Kalshi oil/energy markets, researches catalysts
        via web + X, identifies mispriced CPI contracts,
        calculates Kelly sizing within the strategy's $300 budget,
        presents 3 recommendations with thesis/edge/confidence]

User: "Trade the first two"

Agent: [Places limit orders, logs to portfolio, confirms fills,
        shows updated strategy P&L and account overview]

--- next session ---

User: "How's everything doing?"

Agent: [Pulls current prices across all strategies, calculates
        unrealized P&L per strategy and account-wide, checks
        if any catalysts have changed, flags that one position
        in the oil strategy is up 40% and recommends taking profit]

--- user has an idea ---

User: "I think tariffs are going to cause a chain reaction —
       tariffs → supply costs up → inflation → Fed holds rates.
       Can you build something around that?"

Agent: [Creates "Tariff Chain" strategy (Macro Thematic playbook), $200 budget.
        Maps the causal chain, identifies Kalshi markets at each link,
        researches current tariff news, presents initial opportunities.]
```

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Strategy Management** | Create, configure, and manage thematic trade groupings with budgets and risk limits |
| **Market Discovery** | Scan markets filtered by playbook and strategy parameters |
| **Catalyst Research** | Web search + X/Twitter to find and verify catalysts across multiple sources |
| **Trade Analysis** | Kelly sizing, edge calculation, risk/reward framing — all within strategy and account limits |
| **Order Execution** | Place, monitor, and cancel limit orders (user must confirm every trade) |
| **Portfolio Tracking** | Persistent state across sessions — per-strategy and account-wide P&L, win rates, history |
| **Risk Management** | Two-layer controls: strategy-level sizing + account-level exposure, correlation, and drawdown |
| **Performance Attribution** | Understand WHY you made/lost money — was it the playbook, the timing, or the thesis? |

---

## Portfolio Model

### Hierarchy: Account → Strategy → Trade

```
Account ($1,000 allocated)
│
├── Settings
│   ├── Risk preferences (max loss/day, drawdown pause)
│   ├── Exchange credentials (Kalshi API key)
│   └── Notification preferences
│
├── Strategy: "Oil Supply Chain" (Macro Thematic playbook)    — $300 budget
│   ├── Config: causal chain map, market filters, sizing rules
│   └── Trades: 3 open positions tracking Hormuz → CPI → Fed
│
├── Strategy: "Tariff Chain" (Macro Thematic playbook)        — $200 budget
│   ├── Config: tariff → inflation → rates chain
│   └── Trades: 2 positions on CPI and rate markets
│
├── Strategy: "March Fed Meeting" (Event-Driven playbook)     — $100 budget
│   ├── Config: catalyst date, entry/exit rules
│   └── Trades: 1 position on rate decision
│
├── Strategy: "Momentum Picks" (Momentum playbook)            — $150 budget
│   ├── Config: drift detection params, auto-scan
│   └── Trades: 4 AI-detected trending contracts
│
├── Strategy: "Lottery Tickets Q2" (Tail Risk playbook)       — $50 budget
│   ├── Config: max entry 3¢, min 14d to expiry
│   └── Trades: 8 cheap contracts across diverse events
│
└── Unallocated cash                              — $200
```

### Concepts

| Concept | What It Is | Who Creates It |
|---------|-----------|---------------|
| **Playbook** | The system-provided type — how to research, enter, size, exit | System-provided (6 types) |
| **Strategy** | User's application of a playbook to a specific idea | User creates or AI suggests |
| **Trade** | An individual position within a strategy | AI recommends, user approves |

A user can have multiple strategies using the same playbook (e.g., two different Macro Thematic strategies). Each strategy has its own budget, trades, and P&L, but they share the same playbook for how to operate.

---

## Playbooks

Six established financial strategy patterns, translated for retail investors:

### 1. Event-Driven

**User thinks:** "Something big is about to happen"

Trade around known catalysts — data releases, votes, hearings, decisions. The edge comes from researching the catalyst more thoroughly than the market and positioning before or immediately after.

- **Timeline:** Hours to days (around the catalyst)
- **Examples:** Fed rate decision, CPI release, Supreme Court ruling, earnings report
- **AI does:** Identifies upcoming catalysts, researches likely outcomes across multiple sources, sizes position based on edge and confidence
- **V2 instruments:** Options around earnings, crypto around regulatory rulings

### 2. Relative Value

**User thinks:** "The math doesn't add up"

Find mispricing between related instruments — calendar spreads, range spreads, cross-instrument inconsistencies. When probabilities must be mathematically consistent but aren't, one side is mispriced.

- **Timeline:** Days to weeks (wait for convergence)
- **Examples:** "Before April" vs "Before July" on same event, CPI range buckets that don't add up
- **AI does:** Scans for mathematical inconsistencies, verifies settlement rules match, calculates net edge after spread costs
- **V2 instruments:** Kalshi probability vs. options implied volatility, cross-exchange arbitrage

### 3. Tail Risk / Convexity

**User thinks:** "This is a cheap shot worth taking"

Buy cheap asymmetric payoffs — small risk, huge potential. Build a diversified portfolio of 5-10 positions where even a low hit rate produces strong returns. This is the Taleb barbell strategy for retail.

- **Timeline:** Weeks to months (optionality needs time)
- **Examples:** 1-2¢ Kalshi contracts with plausible catalysts, far OTM LEAPs, small crypto positions
- **AI does:** Scans for cheap contracts, scores by catalyst plausibility and base rate, builds diversified portfolio, manages as a basket
- **V2 instruments:** Far OTM LEAPs, small crypto positions with asymmetric upside

### 4. Momentum

**User thinks:** "This trend keeps going"

When contracts drift in one direction, information is being incorporated. The AI detects subtle drift patterns, correlates with news flow, and rides the trend.

- **Timeline:** Days to weeks (ride the trend)
- **Examples:** Contract moving from 30¢ to 50¢ over a week, sustained volume increase
- **AI does:** Monitors price drift across markets, correlates with news/sentiment, enters when trend confirmed, exits when momentum fades
- **V2 instruments:** Trend following on options, crypto momentum

### 5. Mean Reversion

**User thinks:** "The market overreacted"

After sharp moves, prices often overshoot. Breaking news causes panic, the market spikes, then fades back when the full picture emerges. The AI rapidly verifies or debunks the catalyst and trades the reversion.

- **Timeline:** Hours to days (fade the overreaction)
- **Examples:** Contract spikes 30 points on a rumor that doesn't fully check out, panic selling on ambiguous news
- **AI does:** Detects sharp moves, immediately researches the catalyst, assesses if the move is justified, recommends fading if overreaction is likely
- **V2 instruments:** Options after earnings overreactions, crypto panic sell-offs

### 6. Macro Thematic

**User thinks:** "I see a chain reaction coming"

Top-down: identify a macro theme and trade the second and third-order effects across instruments. This is what global macro hedge funds do — connect dots across markets.

- **Timeline:** Weeks to months (chain reactions unfold slowly)
- **Examples:** Hormuz → oil → CPI → Fed, Tariffs → supply costs → inflation → rates, AI regulation → tech stocks → prediction markets
- **AI does:** Maps the causal chain, identifies prediction markets at each link, monitors the chain unfolding, recommends trades as each link triggers
- **V2 instruments:** Trade the entire chain across Kalshi + options + crypto simultaneously

---

## Risk Controls

### Two-Layer Model

#### Strategy-Level Controls (per bucket)

| Control | What It Does |
|---------|-------------|
| **Budget cap** | Maximum allocation to this strategy (e.g., $300) |
| **Per-trade Kelly sizing** | Position size based on edge/odds within the strategy budget |
| **Entry rules** | Max entry price, min edge, min time to expiry |
| **Exit rules** | Take-profit target, stop-loss, time-based exit, thesis-invalidation exit |
| **Thesis requirement** | Every trade must have documented thesis before execution |

#### Account-Level Controls (AI as risk officer)

| Control | What It Does |
|---------|-------------|
| **Total exposure cap** | Never invest more than X% of allocated capital |
| **Correlation check** | "You already have 3 strategies that depend on CPI — adding a 4th concentrates risk" |
| **Drawdown pause** | If account drops 15-20%, AI flags it and suggests pausing new trades |
| **Daily loss limit** | Hard stop on new trades after X% loss in a day |
| **Concentration limit** | Max N trades on the same underlying event |

### Risk Controls as Product Differentiator

This is the core value proposition: **the AI won't let you YOLO**. Every professional trading firm has a risk officer. For $100/mo, every retail investor gets one too.

---

## Target Users

### Primary: Retail "Allocate and Watch" Investor

People who want exposure to prediction markets (and eventually options/crypto) but don't want to become full-time traders. They allocate some cash, set up strategies that interest them, and let the AI manage the research, sizing, and risk. They check in periodically to review performance, approve trades, and adjust strategies.

**Key insight:** We're not competing with quant firms on speed. We're competing with the user's own bad habits — FOMO, no exit plan, position sizing by gut feel, holding losers. The AI provides discipline at human timescales (days to months).

### Phase 1: Early Adopters (Launch)
- Active Kalshi traders who want AI-augmented research and discipline
- News/politics junkies who follow events and want to trade their views
- People curious about prediction markets but overwhelmed by the research burden

### Phase 2: Growth
- Users of other prediction platforms (Polymarket, PredictIt) exploring Kalshi
- Retail options traders who want the same AI discipline for their options book
- Crypto traders who want thematic portfolio management

### Phase 3: Scale
- Multi-instrument users running strategies that span Kalshi + options + crypto
- Strategy marketplace: users share/sell strategy configurations
- API access for programmatic strategy management

---

## Monetization

### Tier Structure

| Tier | Price | Monitoring | Features |
|------|-------|-----------|----------|
| **Standard** | $100/mo | 5 checks/day during market hours | Full trading, all 6 playbooks, unlimited strategies, risk controls |
| **Premium** | $500/mo | Hourly checks (24/7) | Everything in Standard + hourly monitoring, proactive opportunity scanning, priority alerts |

### Trial & Billing
- **First week free** — full Standard access, credit card required upfront
- **AI token costs included** — we absorb all LLM costs. Users pay a flat monthly fee.
- **Billing via Stripe** — monthly subscription, auto-renew, cancel anytime

### Revenue Drivers
- **Subscriptions** — flat monthly fee covers all AI costs
- **Upgrade incentive** — Standard users who want faster monitoring naturally upgrade to Premium
- **Unit economics** — at ~$0.50-2/day AI cost per active user, Standard ($100/mo) has healthy margins

---

## What We're Forking (Vercel Chatbot v3.1)

| Layer | What We Get | What We Change |
|-------|------------|----------------|
| **Chat UI** | Streaming chat, markdown, code blocks, model selector | Add trading components (strategy cards, P&L displays, trade confirmations) |
| **Auth** | NextAuth with email/password + guest (JWT, bcrypt, middleware) | Keep NextAuth, add OAuth (Google, GitHub). No Supabase Auth. |
| **AI Integration** | AI SDK with multi-model gateway, 4 built-in tools | Add tools for trading, research, strategy management, risk checks |
| **Database** | Drizzle ORM → PostgreSQL, 8 tables, migrations | Swap Neon for Supabase Postgres, add portfolio/trading tables |
| **Artifacts** | Text/code/image/sheet documents | Add "Trade Recommendation" and "Portfolio Dashboard" artifact types |
| **Streaming** | Resumable streams via Redis | Keep, use Upstash Redis |
| **File Storage** | Vercel Blob | Keep Vercel Blob |

---

## What We're Building New

### 1. Portfolio System (Account → Strategy → Trade)
- Strategy CRUD: create, configure, budget, activate/pause strategies
- Trade logging with strategy association, thesis documentation
- Per-strategy and account-wide P&L calculation (mark-to-market)
- Performance analytics: win rate, P&L, Sharpe, playbook comparison, attribution
- Position monitoring with alert triggers

### 2. Playbook Engine
- 6 playbook definitions with configurable parameters
- Strategy creation: AI structures user's natural language into a strategy config using the playbook's schema
- Strategy execution pipeline: scan → research → rank → recommend → user approves → trade
- Playbook-specific logic (e.g., momentum detects drift patterns, relative value checks mathematical consistency)

### 3. Exchange Integration Layer (V1: Kalshi)
- Kalshi REST client with auth, order management, market data
- Position sync between Kalshi and our portfolio DB
- Order lifecycle management (placed → resting → filled → settled)
- Architected for multi-exchange: `instrument_type` enum on strategies (V1: prediction_market only)

### 4. Risk Engine
- Strategy-level: budget enforcement, Kelly sizing, entry/exit rule validation
- Account-level: exposure caps, correlation detection, drawdown monitoring, daily loss limits
- Pre-trade risk check: every trade passes through risk engine before execution
- Risk dashboard: account health, concentration, correlation matrix

### 5. Research Pipeline
- Web search integration (multi-source triangulation)
- X/Twitter API for real-time sentiment
- Catalyst detection and timeline mapping
- Source credibility scoring

### 6. Billing & Entitlements
- Stripe subscriptions with 7-day trial
- Feature gating by tier (monitoring frequency)
- Usage metering

### 7. Scheduled Operations
- Position price updates (Standard: 5x/day, Premium: hourly)
- Opportunity scanning against active strategies (Premium)
- Email + in-app alerts for threshold crossings, opportunities, settlements
- Daily performance snapshots

---

## Key Principles

1. **AI as Portfolio Manager, Not Tool** — The user allocates capital and expresses ideas. The AI handles research, sizing, risk, and execution. The user approves trades and adjusts strategies.

2. **Institutional Discipline, Retail Simplicity** — Ship with the same strategy frameworks and risk controls that hedge funds use, but presented as simple strategies the user manages through conversation.

3. **State Across Sessions** — Every session picks up where you left off. Your strategies, positions, performance, thesis history — all persistent.

4. **Research Triangulation** — Never trade on a single source. Cross-reference web search, X/Twitter, market data, and historical patterns.

5. **Explicit Risk Controls** — Budget caps, Kelly sizing, correlation checks, drawdown pauses. The AI won't let you YOLO.

6. **Days to Months, Not Milliseconds** — We compete on research quality and discipline, not speed. Every strategy targets human timescales.

---

## Competitive Landscape

| Competitor | What They Do | Our Edge |
|-----------|-------------|----------|
| **Kalshi (native)** | Basic trading UI, no AI | AI portfolio management + strategy discipline + risk controls |
| **Polymarket** | Crypto-based, no AI tools | Regulated (Kalshi), AI-powered, persistent portfolio state |
| **Perplexity / ChatGPT** | General AI, no trading | We execute trades, manage strategies, enforce risk controls |
| **Wealthfront / Betterment** | Robo-advisor for stocks/bonds | We do prediction markets + alternatives, conversational not dashboard |
| **Bloomberg Terminal** | Professional trading tools | 1000x cheaper, AI-native, retail-focused |

---

## Technical Constraints & Decisions

1. **Kalshi API limits** — Rate limits TBD, may need queuing for high-traffic users
2. **Regulatory** — We do NOT provide financial advice. The agent presents analysis, the user decides. All disclaimers required.
3. **Latency** — Kalshi order execution must be <2s. Research can be async.
4. **Data residency** — User trading data is sensitive. Supabase RLS + encryption at rest.
5. **Model costs** — We absorb all AI token costs. Estimated ~$0.50-2/day per active user. Healthy margins at $100/mo.
6. **Multi-instrument architecture** — V1 is Kalshi only, but schema and tool layer architected for `instrument_type` enum so V2 exchanges slot in without restructuring.

---

## Success Metrics

| Metric | 3-Month Target | 12-Month Target |
|--------|---------------|-----------------|
| Registered users | 500 | 5,000 |
| Paid subscribers (Standard) | 30 | 300 |
| Paid subscribers (Premium) | 5 | 50 |
| MRR | $5,500 | $55,000 |
| Trades executed | 1,000 | 50,000 |
| Strategies created per user (avg) | 2 | 4 |
| Trial → Paid conversion | 20% | 30% |
| Retention (M1) | 40% | 60% |

---

## Non-Goals (V1)

- Mobile app (web-first, responsive)
- Automated trading / bots (user must confirm every trade)
- Multi-exchange support (V1 is Kalshi only — architected for V2 multi-instrument)
- Social / copy trading (single-user only in V1)
- Custom model fine-tuning
- Real-time price charts (link to exchange UI instead)
- Competing on execution speed (days-to-months timelines, not HFT)
