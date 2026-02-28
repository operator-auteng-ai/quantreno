# Kalshi Prediction Market Trading SOP
## Volatility Swing Strategy for Binary Contracts

---

## Quick Start Command

When starting a new session, just say:

> "Run the Kalshi market scan"

I'll execute the full research workflow below and deliver actionable trade recommendations.

---

## Phase 1: Market Discovery (5 min)

### Step 1.1 - Pull Recent Trading Activity
```
Tool: kalshi:get_trades (limit: 100)
```
**Why:** Recent trades reveal what's HOT right now. High-volume tickers with rapid price changes signal catalysts in play.

**What I'm scanning for:**
- Tickers appearing multiple times (active markets)
- Large trade sizes (100+ contracts)
- Prices near extremes (< 20¢ or > 80¢) that just moved
- Political/economic tickers (KXGOVSHUT, KXFED, etc.)

### Step 1.2 - Pull Upcoming Events
```
Tool: kalshi:get_events (limit: 100, status: open, with_nested_markets: true)
```
**Why:** Events with imminent deadlines have the highest volatility potential.

**What I'm filtering for:**
- Settlement dates within 7 days (ideally 24-72 hours)
- Multiple related markets (indicates complex event with swing potential)
- Categories: Politics, Economics, Fed/Rates, Government

### Step 1.3 - Check Your Portfolio Context
```
Tool: kalshi:get_balance
Tool: kalshi:get_positions
```
**Why:** Know your buying power and existing exposure before recommending new trades.

---

## Phase 2: Catalyst Research (10 min)

### Step 2.1 - Web Search for Breaking News
```
Tool: web_search (query: "[event topic] latest news today")
Tool: web_search (query: "[event topic] [key date] what to expect")
```

**Search patterns by market type:**

| Market Type | Search Queries |
|-------------|----------------|
| Government Shutdown | "government shutdown [date]", "continuing resolution vote", "appropriations bill status" |
| Fed Rate Decision | "FOMC meeting [date]", "fed funds futures", "CME FedWatch" |
| Economic Data | "[report name] consensus estimate", "[report] whisper number" |
| Elections | "[candidate] polling [state]", "[election] prediction markets" |
| Geopolitical | "[country] [event] latest", "breaking [region] news" |

### Step 2.2 - Identify the Catalyst Timeline
For each promising market, I map out:

1. **Hard Deadline** - When does this resolve? (exact date/time)
2. **Decision Points** - What votes/announcements/data releases matter?
3. **Key Players** - Who controls the outcome? What are their incentives?
4. **Information Asymmetry** - What do insiders know that the market might not?

### Step 2.3 - Cross-Reference Multiple Sources
Never trust a single source. I triangulate:
- Official government/institutional sources
- Major news outlets (Reuters, AP, Bloomberg)
- Specialist publications (Roll Call for Congress, CME for rates)
- Social media signals (Twitter/X for breaking developments)

---

## Phase 3: Market Analysis (5 min)

### Step 3.1 - Deep Dive on Target Market
```
Tool: kalshi:get_market (ticker: "[TARGET]")
```

**Key metrics I evaluate:**

| Metric | What It Tells Me | Green Flag | Red Flag |
|--------|------------------|------------|----------|
| **Volume 24h** | Market attention | > $500k | < $50k |
| **Open Interest** | Skin in the game | > $1M | < $100k |
| **Liquidity** | Can you exit? | > $10M | < $1M |
| **Bid-Ask Spread** | Transaction cost | 1-2¢ | > 5¢ |
| **Previous Price** | Recent movement | Big move = catalyst | Stagnant = no edge |

### Step 3.2 - Orderbook Analysis
```
Tool: kalshi:get_orderbook (ticker: "[TARGET]")
```

**What I'm looking for:**
- **Depth at best bid/ask** - Can you move $1k+ without slippage?
- **Price walls** - Large orders at round numbers (50¢, 75¢) act as support/resistance
- **Imbalance** - More YES bids vs NO bids (or vice versa) signals directional pressure

### Step 3.3 - Calculate Implied vs Actual Probability

This is where mispricing lives.

**Formula:**
```
Market Implied Probability = YES Price in cents / 100
My Estimated Probability = Base rate × Adjustment factors

Mispricing = |My Estimate - Market Implied|
```

**Example:**
- Market says: 86¢ YES (86% implied shutdown probability)
- My analysis: House in recess + funding expires at midnight = 95% actual probability
- Mispricing: 9 points → BUY YES (market underpricing shutdown)

---

## Phase 4: Mispricing Framework

### The Four Quadrants of Edge

```
                    HIGH CONFIDENCE
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         │   STRONG BUY   │   STRONG BUY   │
         │   (YES side)   │   (NO side)    │
         │                │                │
MARKET   │────────────────┼────────────────│ MARKET
UNDER-   │                │                │ OVER-
PRICES   │   WEAK BUY     │   WEAK BUY     │ PRICES
EVENT    │   (YES side)   │   (NO side)    │ EVENT
         │                │                │
         └────────────────┼────────────────┘
                          │
                    LOW CONFIDENCE
```

### My Mispricing Detection Heuristics

**1. Recency Bias**
Markets often underreact to breaking news in the first 30-60 minutes. If major news just dropped and price moved only 5-10 points, there may be more to come.

**2. Weekend/Overnight Gaps**
Political events that develop over weekends get mispriced Sunday night when liquidity is thin.

**3. Consensus Anchoring**
When expert consensus is strong (90%+ agree), markets often price in 75-85% instead of 95%+. The "something could happen" premium gets overweighted.

**4. Fat Tail Underpricing**
Low-probability events (< 15% odds) are often underpriced because:
- Most traders ignore them
- Small absolute gains don't feel worth it
- But 10¢ → $1.00 is a 10x return

**5. Calendar Effects**
- Friday afternoon: Traders close positions → prices compress toward 50¢
- Monday morning: Fresh news gets priced → volatility spike
- Settlement day: Prices move toward 0¢ or 100¢ rapidly

### Red Flags That Kill Edge

- **Efficient markets** - Heavily traded, no recent catalyst, price stable for days
- **Ambiguous resolution** - Rules are unclear, could settle either way
- **Illiquid** - Can't exit if you're wrong
- **Already moved** - Price already reflects the news (you're late)
- **Insider-driven** - Entertainment/sports where insiders trade (e.g., Super Bowl ads)

---

## Phase 5: Position Sizing & Risk Management

### Kelly Criterion (Simplified)

```
Optimal Bet Size = (Edge / Odds) × Bankroll

Where:
- Edge = Your probability - Market probability  
- Odds = Potential profit / Amount risked
```

**My Conservative Modification:**
Use Half-Kelly to reduce volatility:
```
Position Size = 0.5 × (Edge / Odds) × Available Balance
```

### Position Sizing Table

| Confidence Level | Max Position Size | Example ($1000 bankroll) |
|------------------|-------------------|--------------------------|
| 🟢 High (>15% edge) | 10% of bankroll | $100 |
| 🟡 Medium (5-15% edge) | 5% of bankroll | $50 |
| 🔴 Low (<5% edge) | 2% of bankroll | $20 |

### Stop-Loss Rules

Since these are binary contracts, traditional stops don't work. Instead:

1. **Time stops** - If thesis hasn't played out in 50% of time to expiry, re-evaluate
2. **News stops** - If new information invalidates thesis, exit immediately
3. **Never average down** - If price moves against you, your thesis was wrong

---

## Phase 6: Trade Execution

### Order Types

**Limit Orders (Preferred)**
```
Tool: kalshi:create_order
- action: "buy"
- side: "yes" or "no"  
- type: "limit"
- yes_price or no_price: [your price in cents]
- count: [number of contracts]
```

**Why limit orders:**
- Control your entry price
- Avoid slippage on large orders
- Can improve on bid-ask spread

**Market Orders (When Speed Matters)**
```
- type: "market"
```

**When to use market:**
- Breaking news and you need to be in NOW
- Very liquid markets with tight spreads
- Small position sizes

### Execution Checklist

Before I recommend any trade, I verify:

- [ ] Market has sufficient liquidity (>$1M)
- [ ] Spread is acceptable (<3¢)
- [ ] Position size follows risk rules
- [ ] Thesis is clearly articulable
- [ ] Exit plan is defined
- [ ] No conflicting positions

---

## Phase 7: Trade Monitoring

### Active Position Review

```
Tool: kalshi:get_positions
Tool: kalshi:get_orders (status: "resting")
```

**Daily checks:**
1. Has new information emerged?
2. Has price moved significantly?
3. Is thesis still valid?
4. Should I add, hold, or exit?

### Exit Triggers

**Take Profit:**
- Price reaches 90%+ of max value (e.g., 92¢+ for YES position)
- Edge has been fully captured
- Better opportunity elsewhere

**Cut Loss:**
- Thesis invalidated by new information
- Price moves 20%+ against position with no clear catalyst
- Approaching expiry with unfavorable odds

---

## Appendix A: Market Type Playbooks

### Government Shutdown Markets

**Key sources:**
- congress.gov (bill status)
- Roll Call / Politico (congressional coverage)
- OPM.gov (official shutdown notices)

**Typical pattern:**
1. Deadline approaches → odds rise to 50-70%
2. Last-minute deal rumors → sharp drops
3. Deal falls through → spikes to 80%+
4. Resolution passes → crashes to 0¢

**Edge opportunity:** Markets often underprice "technical" shutdowns (brief lapses that resolve quickly).

---

### Fed Rate Decision Markets

**Key sources:**
- CME FedWatch Tool (futures-implied probabilities)
- Federal Reserve economic projections
- Fed speaker calendars

**Typical pattern:**
- 2 weeks out: Wide uncertainty
- 1 week out: Consensus forms
- Day of: Price converges to near-certainty

**Edge opportunity:** Fed speakers sometimes telegraph decisions. Markets lag behind speeches by hours.

---

### Economic Data Markets (CPI, Jobs, GDP)

**Key sources:**
- Bloomberg consensus estimates
- Cleveland Fed Inflation Nowcast
- Atlanta Fed GDPNow

**Typical pattern:**
- Prices cluster around consensus estimate
- "Whisper numbers" can differ from official consensus

**Edge opportunity:** Nowcast models update daily and often diverge from week-old consensus estimates.

---

### Election/Political Markets

**Key sources:**
- FiveThirtyEight / Silver Bulletin
- State-specific polling aggregators
- Early voting data (when available)

**Typical pattern:**
- High volatility around debates/major events
- Gradual trend toward eventual winner
- Sharp moves on election night

**Edge opportunity:** Markets overreact to single polls. Aggregates are more stable.

---

## Appendix B: Quick Reference Commands

| Task | What to Say |
|------|-------------|
| Full market scan | "Run the Kalshi market scan" |
| Check specific market | "Analyze [TICKER] for me" |
| Find catalysts this week | "What Kalshi markets have catalysts in the next 7 days?" |
| Research breaking news | "There's news about [X]. Check Kalshi markets." |
| Review my positions | "How are my Kalshi positions doing?" |
| Execute a trade | "Buy [X] contracts of [TICKER] [YES/NO] at [PRICE]" |
| Check my balance | "What's my Kalshi balance?" |

---

## Appendix C: Example Research Session

### User Prompt:
> "Run the Kalshi market scan"

### My Workflow:

1. **Pull recent trades** → Identify hot markets
2. **Pull events** → Find upcoming catalysts  
3. **Check balance** → Know buying power
4. **Web search** → Research top 3 candidates
5. **Deep dive** → Analyze best opportunity
6. **Recommendation** → Present trade with:
   - Ticker & current price
   - My probability estimate vs market
   - Catalyst timeline
   - Recommended position size
   - Entry price target
   - Exit plan

### Output Format:

```
## 🎯 TOP PICK: [TICKER]

**Market:** [Title]
**Current Price:** [X]¢ YES / [Y]¢ NO
**Expires:** [Date/Time]
**24h Volume:** $[X]

### Catalyst Analysis
[What's driving this market]

### My Probability Estimate
- Market says: [X]%
- I estimate: [Y]%
- Edge: [Z] points

### The Trade
- Direction: BUY [YES/NO]
- Entry: [X]¢
- Target: [Y]¢
- Position size: $[Z] ([N] contracts)

### Risk Factors
- [What could go wrong]

### Confidence: [🟢 High / 🟡 Medium / 🔴 Low]
```

---

*Last updated: January 2026*
*Strategy designed for short-term catalyst-driven binary contracts*