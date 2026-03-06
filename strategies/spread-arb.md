# Strategy: Spread Arbitrage — Opposing Market Mispricing

**Invoke:** "Find spread opportunities"

---

## Overview

Find pairs of related Kalshi markets where the implied probabilities don't add up. When two markets share an underlying event but the math is inconsistent, one side is mispriced. Buy the underpriced leg. This is the closest thing to a "free lunch" on Kalshi — lower risk, lower reward, but more consistent.

---

## Phase 1: Scan

### 1a. Pull events with multiple nested markets
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)

Focus on events with 3+ nested markets — these have the most spread opportunities.
Look for:
- Time-series markets (same event, different deadlines): "Before March 1", "Before April 1", etc.
- Range markets (same metric, different thresholds): "Above 3.5%", "Above 4.0%", etc.
- Multi-outcome markets: "Who wins [X]?" with multiple candidates
```

### 1b. Portfolio context
```
Tool: mcp__kalshi__get_balance
Tool: mcp__kalshi__get_positions (count_filter: "position")
```

---

## Phase 2: Mispricing Detection

### Type 1: Time-Series Spread (Calendar Spread)

**Setup:** Same event, different time horizons.
Example: "Khamenei leaves office before April 1" vs "before July 1"

**Math check:**
```
P(before July) must be >= P(before April)

If P(April YES) = 45¢ and P(July YES) = 57¢:
  Implied P(leaves between April and July) = 57¢ - 45¢ = 12¢ (12%)

Is 12% reasonable for that 3-month window?
If you think it's too LOW → buy July YES (or sell April YES)
If you think it's too HIGH → buy April YES relative to July
```

**How to scan:**
```
For each event with time-series markets:
1. Sort markets by expiration date
2. Calculate the spread between adjacent contracts
3. Flag spreads that seem too wide or too narrow
4. Research whether the marginal time period has catalysts that justify the spread
```

### Type 2: Range Spread (Vertical Spread)

**Setup:** Same metric, different strike levels.
Example: "CPI above 3.0%" at 85¢ YES, "CPI above 3.5%" at 40¢ YES

**Math check:**
```
P(CPI > 3.0%) must be >= P(CPI > 3.5%)

These MUST be monotonic — higher thresholds = lower probability.
If they're not, there's an arbitrage.

Also check: P(between 3.0% and 3.5%) = P(>3.0%) - P(>3.5%) = 85 - 40 = 45¢
Does 45% probability for that range make sense given consensus estimates?
```

**How to scan:**
```
For each event with range/threshold markets:
1. Sort markets by strike level
2. Verify monotonicity (each higher strike should be cheaper)
3. Calculate the implied probability of each range bucket
4. Compare to consensus estimate distribution
5. Flag any non-monotonic prices or fat/thin range buckets
```

### Type 3: Multi-Outcome Completeness Check

**Setup:** Mutually exclusive outcomes for an event.
Example: "Who is the next Supreme Leader?" — candidates A, B, C, "Position abolished"

**Math check:**
```
Sum of all YES prices should equal ~100¢ (minus the vig/spread)

If Sum > 105¢: the vig is eating you alive, probably no edge
If Sum < 98¢: there's a structural underpricing across the market
If one outcome's YES + NO != ~100¢: individual market is broken

For each outcome:
  YES price + NO price should ≈ 100¢
  If YES + NO > 102¢: both sides are overpriced (vig)
  If YES + NO < 98¢: both sides are underpriced (opportunity)
```

**How to scan:**
```
For each multi-outcome event:
1. Sum all YES prices across outcomes
2. Check if any individual market has YES + NO significantly != 100
3. Check if the full set of outcomes sums to a reasonable total
4. Flag outliers — the most underpriced outcome relative to its true probability
```

---

## Phase 3: Deep Dive on Flagged Spreads

For each mispriced spread found:
```
Tool: mcp__kalshi__get_market (ticker: "[LEG_1]")
Tool: mcp__kalshi__get_market (ticker: "[LEG_2]")
Tool: mcp__kalshi__get_orderbook (ticker: "[LEG_1]")
Tool: mcp__kalshi__get_orderbook (ticker: "[LEG_2]")
```

### Verify the Mispricing Is Real

| Check | Why |
|-------|-----|
| Read rules_secondary for BOTH markets | Settlement rules may differ (e.g., death clause on one but not another) |
| Check liquidity on both legs | Can you actually execute both sides? |
| Check spreads on both legs | Wide spreads eat the arb profit |
| Verify the markets are truly related | Sometimes "similar" tickers have different resolution criteria |

### Calculate Net Edge
```
For calendar spreads:
  Edge = (Your estimate of spread) - (Market implied spread)
  Cost = price of entering both legs (including spread costs)
  Net profit = Edge - Cost

For range spreads:
  Edge = (Your estimate of range probability) - (Market implied range probability)

For multi-outcome:
  Edge = (Your probability for outcome X) - (Market implied probability for X)
```

---

## Phase 4: Position Sizing

**Hard cap: $10 max per leg.**

| Spread Type | Position Size (per leg) | Expected Edge |
|-------------|------------------------|---------------|
| Hard arbitrage (math is broken) | $10 | Near-certain, limited by liquidity |
| Soft arbitrage (probabilities seem off) | $7 | 5-15% estimated edge |
| Speculative spread (disagree with time premium) | $5 | Uncertain edge |

### For two-leg trades:
```
Total capital at risk = cost of leg 1 + cost of leg 2 (max $20 total)
Max profit = payout of winning leg - total cost
Ensure max profit > 2× max loss to justify the complexity
```

---

## Phase 5: Execution

### Single-Leg (simpler, preferred)
When you identify the underpriced side of a spread, just buy that one:
- Example: July YES at 57¢ seems cheap relative to April YES at 45¢ → just buy July YES
- Simpler execution, no need to manage two positions

### Two-Leg (true arbitrage)
When the math is clearly broken and you can lock in profit:
1. Place the more liquid leg first (better fill)
2. Immediately place the second leg
3. Use limit orders on both — never market buy a spread
4. Account for the spread cost on BOTH legs in your profit calculation

### Exit
- **Hard arb:** Hold both legs to resolution — profit is locked in
- **Soft arb:** Monitor the spread. If it widens further, add. If it collapses (mispricing corrected), take profit early.
- **If one leg becomes unfavorable:** Re-evaluate. You may need to exit one leg at a loss if the thesis changes.

---

## Output Format

```
## SPREAD OPPORTUNITY: [EVENT NAME]

### The Mispricing
**Leg 1:** [TICKER_1] — [Title] — [X]¢ YES
**Leg 2:** [TICKER_2] — [Title] — [Y]¢ YES
**Implied Spread:** [Z]¢ ([Z]% probability of [description])
**My Estimate:** [W]¢ ([W]% probability)
**Edge:** [Z-W]¢

### Type: [Calendar / Range / Multi-Outcome]

### Analysis
- Why the spread is mispriced: [explanation]
- What the market is missing: [information]
- Settlement rule differences (if any): [check rules_secondary]

### The Trade
- Action: BUY [TICKER] [YES/NO] at [X]¢
- (Optional second leg): SELL/BUY [TICKER_2] at [Y]¢
- Net cost: $[Z]
- Max profit: $[W]
- Position size: $[total] ([N] contracts per leg)

### Risk Factors
- Settlement rule differences between legs
- Liquidity risk (can you exit both legs?)
- Correlation assumption may be wrong

### Confidence: [High / Medium / Low]
```
