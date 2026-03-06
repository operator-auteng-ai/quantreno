# Strategy: Oil & Energy Trading

**Invoke:** "Run the oil strategy"

---

## Overview

Trade Kalshi oil/energy markets by exploiting the lag between real-world supply/demand signals and market pricing. Energy markets are driven by scheduled data releases and geopolitical disruptions — both create predictable volatility windows.

---

## Phase 1: Scan

### 1a. Find oil/energy markets
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)

Filter event tickers for:
- KXOIL, KXWTI, KXBRENT, KXCRUDE
- KXGAS, KXGASPRICE, KXNATGAS
- KXENERGY
- Any event with "oil", "crude", "gas", "energy", "petroleum" in the title
```

### 1b. Check recent oil trade activity
```
Tool: mcp__kalshi__get_trades (limit: 50)

Filter for oil/energy tickers in recent trades.
High volume = active catalyst.
```

### 1c. Portfolio context
```
Tool: mcp__kalshi__get_balance
Tool: mcp__kalshi__get_positions (count_filter: "position")
```

---

## Phase 2: Catalyst Research

### Scheduled Catalysts (check weekly)

| Catalyst | Source | Day | Time (ET) |
|----------|--------|-----|-----------|
| EIA Weekly Petroleum Status | eia.gov | Wednesday | 10:30 AM |
| EIA Natural Gas Storage | eia.gov | Thursday | 10:30 AM |
| API Weekly Inventory (preview) | api.org | Tuesday | 4:30 PM |
| Baker Hughes Rig Count | bakerhughes.com | Friday | 1:00 PM |
| OPEC Monthly Oil Report | opec.org | ~12th of month | varies |
| OPEC+ Meeting Decisions | opec.org | scheduled | varies |
| IEA Monthly Oil Report | iea.org | ~15th of month | varies |

### Unscheduled Catalysts

| Catalyst | Web Search Query |
|----------|-----------------|
| Strait of Hormuz disruption | "Strait of Hormuz shipping latest [date]" |
| Middle East conflict | "[country] oil supply disruption [date]" |
| US sanctions on oil producers | "US oil sanctions [country] latest" |
| Hurricane/weather disruption | "Gulf of Mexico oil production hurricane [date]" |
| OPEC+ surprise cut/increase | "OPEC production decision latest" |
| SPR release/purchase | "strategic petroleum reserve release [date]" |

### Web Search Sequence
```
Tool: WebSearch
Queries (run in parallel):
1. "crude oil price today WTI Brent latest"
2. "EIA petroleum inventory report [this week's date]"
3. "OPEC production decision latest [month year]"
4. "[any active geopolitical disruption] oil supply impact"
```

---

## Phase 3: Market Analysis

### For each oil/energy market found:
```
Tool: mcp__kalshi__get_market (ticker: "[TARGET]")
Tool: mcp__kalshi__get_orderbook (ticker: "[TARGET]")
```

### Key Metrics for Oil Markets

| Metric | What Matters |
|--------|-------------|
| Settlement date | Is it before or after the next EIA report? |
| Strike price | Where is it relative to current spot? |
| Implied probability | Does it match analyst consensus? |
| Volume 24h | Is there pre-report positioning? |
| Spread | Can you get in/out efficiently? |

### Edge Detection for Oil

**1. EIA Report Surprise**
- Compare consensus estimate vs. actual build/draw
- If EIA reports a surprise (>2M barrel deviation from consensus), markets lag 15-30 min
- API Tuesday data previews Wednesday's EIA — if API surprises, position before EIA

**2. Geopolitical Supply Shock**
- Breaking news about supply disruption → immediate 3-5% oil move
- Kalshi markets often lag real oil futures by 30-60 minutes
- Check if Kalshi oil market pricing reflects the new spot price

**3. OPEC Decision Timing**
- Pre-meeting: Wide uncertainty, prices cluster near 50¢
- Post-decision: Sharp move toward resolution
- Edge: OPEC "sources say" leaks often precede official announcements by hours

**4. Weather/Hurricane**
- Gulf of Mexico produces ~15% of US oil
- Named storms → preventive platform shutdowns → supply reduction
- Markets underweight hurricane impact until platforms actually shut down

---

## Phase 4: Position Sizing (Oil-Specific)

**Hard cap: $10 max per trade.**

| Confidence | Position Size |
|------------|--------------|
| High (data release surprise, confirmed disruption) | $10 |
| Medium (analyst divergence, pre-report positioning) | $7 |
| Low (speculative geopolitical play) | $5 |

---

## Phase 5: Entry & Exit

### Entry
- **Pre-report:** Enter 1-2 hours before scheduled data release at favorable limit price
- **Post-surprise:** Enter within 15 minutes of surprise data using aggressive limit (at the ask)
- **Geopolitical:** Enter immediately when supply disruption confirmed, aggressive limit

### Exit
- **Take profit:** Price moves 15+ points in your favor
- **Cut loss:** If data/event resolves opposite to thesis, exit immediately
- **Time stop:** If report comes out in-line (no surprise), exit — thesis is dead

---

## Output Format

```
## OIL TRADE: [TICKER]

**Market:** [Title]
**Current Price:** [X]¢ YES / [Y]¢ NO
**Expires:** [Date/Time]
**Catalyst:** [EIA report / OPEC decision / supply disruption]
**Catalyst Date:** [When]

### Analysis
- Current WTI spot: $[X]/barrel
- Market strike: $[Y]/barrel
- Consensus: [build/draw estimate or analyst expectation]
- My estimate: [what I think happens]

### The Trade
- Direction: BUY [YES/NO]
- Entry: [X]¢ (limit)
- Target: [Y]¢
- Position size: $[Z] ([N] contracts)

### Risk: [What could go wrong]
### Confidence: [High / Medium / Low]
```
