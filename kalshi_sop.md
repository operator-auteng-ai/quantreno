# Kalshi Prediction Market Trading SOP

---

## Quick Start

| Command | Strategy | File |
|---------|----------|------|
| "Run the Kalshi market scan" | Full scan — all strategies | This file |
| "Run the oil strategy" | Oil & energy markets | `strategies/oil.md` |
| "Find lottery tickets" | Fat tails, <=2% mispriced events | `strategies/fat-tails.md` |
| "Run the volatility swing" | Catalyst-driven price swings | `strategies/volatility-swing.md` |
| "Find spread opportunities" | Opposing market mispricings | `strategies/spread-arb.md` |

### How It Works
- **Full scan:** Runs Phase 1 discovery, then filters results through ALL four strategies, recommends the best opportunities across all of them.
- **Individual strategy:** Reads the strategy file, runs only that strategy's scan/filter/research logic, and recommends trades specific to that approach.
- **Always starts with:** Patch check (`scripts/check-patch-status.sh`), balance + positions check.
- **State persistence:** All trades, recommendations, scans, and performance are logged via `kalshi-state` CLI (see `state/` package). Run from `~/projects/claude/state/`.

---

## Phase 1: Market Discovery (5 min)

### Step 1.1 - Pull Recent Trading Activity
```
Tool: kalshi:get_trades (limit: 20)
```
**Why:** Recent trades reveal what's HOT right now. High-volume tickers with rapid price changes signal catalysts in play.

**What I'm scanning for:**
- Tickers appearing multiple times (active markets)
- Large trade sizes (20+ contracts)
- Prices near extremes (< 20¢ or > 80¢) that just moved
- Political/economic tickers (KXGOVSHUT, KXFED, etc.)

### Step 1.2 - Pull Upcoming Events
```
Tool: kalshi:get_events (limit: 20, status: open, with_nested_markets: true)
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

### Step 1.4 - Check Local State
```
Bash: cd ~/projects/claude/state && uv run kalshi-state positions
Bash: cd ~/projects/claude/state && uv run kalshi-state trades --limit 10
```
**Why:** Review locally tracked positions and recent trade history for context across sessions.

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

### Step 2.1b - X (Twitter) Search for Real-Time Sentiment
```
Tool: Bash → cd ~/projects/claude/x-search && uv run x-search search "[query] -is:retweet lang:en" -n 20
```

**Why:** X posts often surface breaking developments 15-60 minutes before traditional news picks them up. Expert accounts, journalists, and insiders post in real-time.

**Pre-built stream presets (for continuous monitoring):**
```
uv run x-search stream geopolitical   # Iran, Israel, conflict
uv run x-search stream oil            # Crude, OPEC, EIA, supply
uv run x-search stream fed            # FOMC, inflation, PCE, CPI
uv run x-search stream politics       # Shutdown, Congress, votes
uv run x-search stream breaking       # General breaking news
```

**Custom search examples:**
```
uv run x-search search "Khamenei OR Iran regime -is:retweet lang:en" -n 20
uv run x-search search "oil prices OPEC supply -is:retweet" -n 20
uv run x-search search "FOMC rate decision -is:retweet" -n 20
```

### Step 2.2 - Identify the Catalyst Timeline
For each promising market, I map out:

1. **Hard Deadline** - When does this resolve? (exact date/time)
2. **Decision Points** - What votes/announcements/data releases matter?
3. **Key Players** - Who controls the outcome? What are their incentives?
4. **Information Asymmetry** - What do insiders know that the market might not?

### Step 2.3 - Cross-Reference Multiple Sources
Never trust a single source. I triangulate using **three layers**:

| Layer | Source | Tool | Speed |
|-------|--------|------|-------|
| 1. Real-time | X posts from journalists, experts, insiders | `x-search search` | Minutes |
| 2. News | Major outlets (Reuters, AP, Bloomberg) | `WebSearch` | 15-60 min |
| 3. Official | Government sites, central banks, data agencies | `WebSearch` | Hours-days |

**Workflow:** Run X search and WebSearch in parallel for each candidate market. X catches breaking developments first; WebSearch provides confirmation and detail.

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

### Hard Cap: $10 Maximum Per Trade

**All trades are capped at $10 total cost regardless of Kelly sizing or bankroll.**

### Kelly Criterion (Simplified)

```
Optimal Bet Size = min(0.5 × (Edge / Odds) × Available Balance, $10)
```

### Position Sizing Table

| Confidence Level | Position Size |
|------------------|--------------|
| 🟢 High (>15% edge) | $10 |
| 🟡 Medium (5-15% edge) | $7 |
| 🔴 Low (<5% edge) | $5 |

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

**Market Orders — REMOVED**
As of Feb 11, 2026, Kalshi removed market orders from the API. Only limit orders are supported. For fast entries, use an aggressive limit price (at or above the ask for buys, at or below the bid for sells).

### Execution Checklist

Before I recommend any trade, I verify:

- [ ] **Total cost ≤ $10** (hard cap)
- [ ] Market has sufficient liquidity (>$1M)
- [ ] Spread is acceptable (<3¢)
- [ ] Position size follows risk rules
- [ ] Thesis is clearly articulable
- [ ] Exit plan is defined
- [ ] No conflicting positions

### Step 6.1 - Log Recommendation (before execution)
```
Bash: cd ~/projects/claude/state && uv run kalshi-state log-rec \
  --strategy [STRATEGY] --ticker [TICKER] --side [yes/no] \
  --entry [PRICE_CENTS] --target [TARGET_CENTS] \
  --confidence [high/medium/low] --edge [EDGE_POINTS] \
  --thesis "[WHY]" --catalyst "[CATALYST]" --catalyst-date "[DATE]"
```

### Step 6.2 - Log Trade (after execution)
```
Bash: cd ~/projects/claude/state && uv run kalshi-state log-trade \
  --strategy [STRATEGY] --ticker [TICKER] --side [yes/no] \
  --action [buy/sell] --price [PRICE_CENTS] --count [CONTRACTS] \
  --cost [TOTAL_DOLLARS] --fees [FEES] --order-id "[KALSHI_ORDER_ID]" \
  --thesis "[WHY]" --exit-plan "[EXIT]" --catalyst-date "[DATE]"
```

---

## Phase 7: Trade Monitoring

### Active Position Review

```
Tool: kalshi:get_positions
Tool: kalshi:get_orders (status: "resting")
```

### Real-Time News Check on Open Positions
For each open position, run an X search to check for developments:
```
Bash: cd ~/projects/claude/x-search && uv run x-search search "[position topic] -is:retweet lang:en" -n 10
```

For active fast-moving situations, start a background stream:
```
Bash (background): cd ~/projects/claude/x-search && uv run x-search stream [preset] -n 50
```

**Daily checks:**
1. Has new information emerged? *(X search + WebSearch)*
2. Has price moved significantly? *(get_market on each position ticker)*
3. Is thesis still valid? *(compare original thesis to latest news)*
4. Should I add, hold, or exit?

### Step 7.1 - Close Position (on exit)
```
Bash: cd ~/projects/claude/state && uv run kalshi-state close-position \
  --ticker [TICKER] --exit-price [PRICE_CENTS] --pnl [PNL_DOLLARS]
```

### Exit Triggers

**Take Profit:**
- Price reaches 90%+ of max value (e.g., 92¢+ for YES position)
- Edge has been fully captured
- Better opportunity elsewhere

**Cut Loss:**
- Thesis invalidated by new information
- Price moves 20%+ against position with no clear catalyst
- Approaching expiry with unfavorable odds

### End of Session — Performance Snapshot
```
Bash: cd ~/projects/claude/state && uv run kalshi-state snapshot \
  --balance [BALANCE_CENTS] --positions [OPEN_COUNT] --unrealized [UNREALIZED_PNL_CENTS]
```

---

## Appendix A: Market Type Playbooks

### Government Shutdown Markets

**Key sources:**
- congress.gov (bill status)
- Roll Call / Politico (congressional coverage)
- OPM.gov (official shutdown notices)

**X search:**
```
x-search search "government shutdown OR continuing resolution Congress -is:retweet lang:en" -n 20
x-search stream politics
```

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

**X search:**
```
x-search search "FOMC OR fed rate OR Powell -is:retweet lang:en" -n 20
x-search stream fed
```

**Typical pattern:**
- 2 weeks out: Wide uncertainty
- 1 week out: Consensus forms
- Day of: Price converges to near-certainty

**Edge opportunity:** Fed speakers sometimes telegraph decisions. Markets lag behind speeches by hours. X catches the speech excerpts and reactions fastest.

---

### Economic Data Markets (CPI, Jobs, GDP)

**Key sources:**
- Bloomberg consensus estimates
- Cleveland Fed Inflation Nowcast
- Atlanta Fed GDPNow

**X search:**
```
x-search search "CPI report OR jobs report OR NFP consensus estimate -is:retweet lang:en" -n 20
x-search search "PCE inflation data -is:retweet lang:en" -n 20
```

**Typical pattern:**
- Prices cluster around consensus estimate
- "Whisper numbers" can differ from official consensus

**Edge opportunity:** Nowcast models update daily and often diverge from week-old consensus estimates. Econ X accounts often post updated nowcast readings before mainstream coverage.

---

### Election/Political Markets

**Key sources:**
- FiveThirtyEight / Silver Bulletin
- State-specific polling aggregators
- Early voting data (when available)

**X search:**
```
x-search search "[candidate] OR [race] poll -is:retweet lang:en" -n 20
x-search stream politics
```

**Typical pattern:**
- High volatility around debates/major events
- Gradual trend toward eventual winner
- Sharp moves on election night

**Edge opportunity:** Markets overreact to single polls. Aggregates are more stable. X surfaces new poll drops 10-30 min before aggregators update.

---

### Geopolitical Markets

**Key sources:**
- Reuters, AP, AFP (wire services)
- Regional specialist outlets
- Government/military official statements

**X search:**
```
x-search search "[country] OR [event] breaking -is:retweet lang:en" -n 20
x-search stream geopolitical
```

**Typical pattern:**
- Fog of war: contradictory reports in first hours
- Confirmed reports stabilize pricing over 6-24 hours
- Overreaction to unverified claims, underreaction to official confirmations

**Edge opportunity:** X is the fastest source for breaking geopolitical events. First-hand accounts from journalists and officials post before wire services publish. Use X for speed, then WebSearch to confirm before trading.

---

## Appendix B: Quick Reference Commands

### Strategy Commands
| Command | What It Does |
|---------|-------------|
| "Run the Kalshi market scan" | Full scan across all strategies |
| "Run the oil strategy" | Scan oil/energy markets for catalysts |
| "Find lottery tickets" | Scan for <=2% mispriced events |
| "Run the volatility swing" | Find catalyst-driven swing trades |
| "Find spread opportunities" | Find opposing market mispricings |

### Utility Commands
| Command | What It Does |
|---------|-------------|
| "Analyze [TICKER] for me" | Deep dive on a specific market |
| "What Kalshi markets have catalysts in the next 7 days?" | Near-term catalyst scan |
| "There's news about [X]. Check Kalshi markets." | News-driven market search |
| "How are my Kalshi positions doing?" | Position + P&L review |
| "Buy [X] contracts of [TICKER] [YES/NO] at [PRICE]" | Execute a trade |
| "What's my Kalshi balance?" | Balance check |

### State Management Commands
| Command | What It Does |
|---------|-------------|
| `kalshi-state trades` | View all trade history |
| `kalshi-state trades --strategy oil` | View trades for a strategy |
| `kalshi-state positions` | View all open positions |
| `kalshi-state performance` | View daily performance snapshots |
| `kalshi-state performance --strategy [X]` | Win rate + P&L by strategy |
| `kalshi-state scans` | View scan history |
| `kalshi-state recs` | View recommendations |
| `kalshi-state export trades.csv` | Export trades to CSV |

*Run from:* `cd ~/projects/claude/state && uv run [command]`

---

## Appendix C: Full Scan Workflow

### User Prompt:
> "Run the Kalshi market scan"

### My Workflow:

1. **Check patch status** → Run `scripts/check-patch-status.sh`
2. **Pull recent trades** → Identify hot markets
3. **Pull events (with nested markets)** → Find upcoming catalysts
4. **Check balance + positions** → Know buying power and exposure (Kalshi API + `kalshi-state positions`)
5. **Filter results through each strategy:**
   - **Oil:** Any energy/commodity markets with upcoming catalysts?
   - **Fat tails:** Any markets at 1-2¢ with plausible catalysts?
   - **Volatility swing:** Any markets with catalysts in 24-72 hours + volume spikes?
   - **Spread arb:** Any events with multiple markets where the math doesn't add up?
6. **Research top 3 candidates** (run in parallel for each):
   - `WebSearch` → Official news, consensus estimates, institutional analysis
   - `x-search search "[topic] -is:retweet lang:en" -n 20` → Real-time posts, expert commentary, breaking signals
7. **Deep dive** → Orderbook + trade history on best opportunities
8. **Recommendation** → Present trades with:
   - Ticker & current price
   - Strategy type (oil / fat tail / swing / spread)
   - My probability estimate vs market
   - Catalyst timeline
   - Recommended position size
   - Entry price target
   - Exit plan

9. **Log state** → After execution:
   - `kalshi-state log-scan` — Record scan results
   - `kalshi-state log-rec` — Record each recommendation
   - `kalshi-state log-trade` — Record each executed trade
   - `kalshi-state snapshot` — End-of-session performance snapshot

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

*Last updated: February 2026*
*Strategies: Oil, Fat Tails, Volatility Swing, Spread Arbitrage*