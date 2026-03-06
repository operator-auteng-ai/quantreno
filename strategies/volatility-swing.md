# Strategy: Volatility Swing — Capture the Move

**Invoke:** "Run the volatility swing"

---

## Overview

Trade binary contracts around imminent catalysts (24-72 hours) where a big price move is expected. The edge comes from identifying the catalyst before the market fully prices it in, or from reacting faster than the market after the catalyst hits. Get in, capture the swing, get out.

---

## Phase 1: Scan

### 1a. Find markets with imminent catalysts
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)

Filter for:
- Settlement/close date within 7 days (prioritize 24-72 hours)
- Categories: Politics, Economics, Fed/Rates, Government, Geopolitical
- Multiple nested markets = complex event = more swing potential
- SKIP: Sports, weather, entertainment
```

### 1b. Find markets with sudden volume spikes
```
Tool: mcp__kalshi__get_trades (limit: 50)

Look for:
- Same ticker appearing 5+ times in recent trades (something is happening NOW)
- Large individual trades (100+ contracts)
- Price movement from previous: |last_price - previous_price| > 10 points
- These are the "hot" markets where catalysts are in play
```

### 1c. Portfolio context
```
Tool: mcp__kalshi__get_balance
Tool: mcp__kalshi__get_positions (count_filter: "position")
Tool: mcp__kalshi__get_orders (status: "resting")
```

---

## Phase 2: Catalyst Research

### For each hot market, identify the catalyst:

```
Tool: WebSearch
Queries (run in parallel):
1. "[event topic] latest news today"
2. "[event topic] [key date] what to expect"
3. "[event topic] prediction forecast odds"
```

### Map the Catalyst Timeline

| Question | Why It Matters |
|----------|---------------|
| What is the exact decision point? (vote, data release, announcement) | Timing your entry |
| When does the market close/settle? | How much time for thesis to play out |
| What are the possible outcomes? | Mapping the price move scenarios |
| What does the market currently imply? | Is there room for a move? |
| What do experts/polls/models say? | Your probability estimate |

### Cross-Reference (always triangulate)
- Official sources (government sites, central bank)
- Major wire services (Reuters, AP, Bloomberg)
- Specialist publications (Roll Call, CME FedWatch)
- Social media / breaking news feeds

---

## Phase 3: Market Analysis

### Deep dive on each target
```
Tool: mcp__kalshi__get_market (ticker: "[TARGET]")
Tool: mcp__kalshi__get_orderbook (ticker: "[TARGET]")
Tool: mcp__kalshi__get_trades (ticker: "[TARGET]", limit: 30)
```

### Swing Opportunity Scoring

| Signal | Points |
|--------|--------|
| Catalyst in <24 hours | +3 |
| Price moved 10+ points today (momentum) | +2 |
| 24h volume > $100K (active market) | +2 |
| Spread <= 2¢ (can enter/exit cheaply) | +2 |
| Expert consensus diverges from market price by 10+ points | +3 |
| Breaking news not yet reflected in price | +4 |
| Price near 50¢ (maximum swing potential both directions) | +1 |
| **Score 10+: Strong candidate** | |

### Volatility Patterns to Exploit

**1. Pre-Announcement Drift**
- Markets drift toward the expected outcome 6-24 hours before the announcement
- If consensus is strong and market hasn't moved, buy the consensus side early
- Edge window: 6-24 hours before event

**2. Post-Announcement Underreaction**
- When news drops, the first move is often only 50-70% of the eventual move
- If big news hits and market moves 10 points, there may be 5-10 more to come
- Edge window: 0-60 minutes after event

**3. Friday Compression → Monday Spike**
- Traders close positions Friday afternoon → prices compress toward 50¢
- Weekend news develops without trading → Monday open has a gap
- Edge: Buy Friday afternoon when prices are artificially compressed

**4. Settlement Day Convergence**
- On settlement day, prices rapidly move toward 0¢ or 100¢
- If you have high confidence in the outcome, buy contracts cheaply from panicking sellers
- Edge window: Final 4-8 hours before settlement

---

## Phase 4: Position Sizing

Swing trades have defined time horizons. Size based on confidence:

**Hard cap: $10 max per trade.**

| Confidence | Position Size | Typical Hold Time |
|------------|--------------|-------------------|
| High (15%+ edge, catalyst imminent) | $10 | 1-24 hours |
| Medium (5-15% edge, catalyst approaching) | $7 | 1-3 days |
| Low (<5% edge, speculative momentum) | $5 | hours |

### Half-Kelly Formula (capped at $10)
```
Position = min(0.5 × (Edge / Odds) × Balance, $10)

Where:
- Edge = Your probability - Market probability
- Odds = (100 - entry_price) / entry_price  [for YES buys]
```

---

## Phase 5: Entry & Exit

### Entry Timing
- **Anticipation play:** Enter 2-6 hours before catalyst. Use limit orders 1-2¢ below ask.
- **Reaction play:** Enter within 15 minutes of news breaking. Use aggressive limit at the ask.
- **Momentum play:** Enter when volume spikes and price is trending. Ride the wave.

### Exit Rules (STRICT)
- **Take profit at 15+ points gained** — don't get greedy on swing trades
- **Cut loss if catalyst resolves against you** — exit immediately, no hoping
- **Time stop:** If thesis hasn't played out in 50% of time to expiry, re-evaluate
- **News stop:** New information invalidates thesis → exit regardless of P&L
- **Never average down** — if price moves against you, your thesis was wrong

---

## Output Format

```
## SWING TRADE: [TICKER]

**Market:** [Title]
**Current Price:** [X]¢ YES / [Y]¢ NO
**Spread:** [X]¢
**Expires:** [Date/Time]
**Catalyst:** [What event drives the move]
**Catalyst Timing:** [When it hits]

### Probability Assessment
- Market implies: [X]%
- My estimate: [Y]%
- Edge: [Z] points
- Sources: [What informs my estimate]

### The Trade
- Direction: BUY [YES/NO]
- Entry: [X]¢ (limit)
- Target: [Y]¢ (take profit)
- Stop: [Z]¢ or [condition] (cut loss)
- Position size: $[Z] ([N] contracts)
- Hold time: [expected duration]

### Scenario Map
- Bull case: [What happens → price goes to X¢]
- Base case: [What happens → price goes to Y¢]
- Bear case: [What happens → price goes to Z¢]

### Confidence: [High / Medium / Low]
```
