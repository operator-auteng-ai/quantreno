# Strategy: Fat Tails — Lottery Tickets (<=2%)

**Invoke:** "Find lottery tickets"

---

## Overview

Systematically scan for markets priced at 1-2¢ (1-2% implied probability) where the actual probability is higher — even 5% actual probability on a 1¢ contract is a 5x expected return. Build a diversified portfolio of 5-10 cheap lottery tickets where the asymmetric payoff (1¢ → $1.00 = 100x max) compensates for the low hit rate.

---

## Phase 1: Scan

### 1a. Pull all open markets and filter for cheap YES or NO sides
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)

Filter nested markets for:
- yes_bid <= 2 OR yes_ask <= 3 (cheap YES — market says it won't happen)
- no_bid <= 2 OR no_ask <= 3 (cheap NO — market says it WILL happen, but maybe it won't)
- SKIP markets with 0 volume or no bids (dead markets, no exit liquidity)
- SKIP sports/entertainment (insider-driven, hard to analyze)
```

### 1b. Pull recent trades to find active cheap markets
```
Tool: mcp__kalshi__get_trades (limit: 50)

Filter for trades where yes_price <= 5 or (100 - yes_price) <= 5
Active trading on cheap contracts = someone sees something.
```

### 1c. Portfolio context
```
Tool: mcp__kalshi__get_balance
Tool: mcp__kalshi__get_positions (count_filter: "position")
```

---

## Phase 2: Triage — Is the 1-2% Real?

For each cheap market found, ask:

### The Five Questions

1. **Is there a plausible catalyst before expiry?**
   - A 1¢ YES contract expiring in 3 days with no upcoming event = truly worthless
   - A 1¢ YES contract expiring in 30 days with a major decision pending = potentially mispriced

2. **Has this type of event happened before at this probability?**
   - Base rate matters. "Government shutdown" at 2¢ when funding expires in a week → shutdowns happen ~30% of the time historically
   - "Alien contact" at 1¢ → probably correctly priced

3. **Is the market neglected or actively traded?**
   - Low volume + low price = nobody cares = possibly neglected
   - Some volume + low price = people have looked and decided it's unlikely = harder to find edge

4. **Are there information sources the market isn't pricing?**
   - Nowcast models, insider whispers, obscure government filings
   - If you can find information the typical Kalshi trader doesn't see, that's edge

5. **What's the time value?**
   - 1¢ with 6 months to expiry has embedded optionality — a lot can change
   - 1¢ with 2 days to expiry is probably correctly priced unless something is imminent

### Web Search for Each Candidate
```
Tool: WebSearch
Queries:
1. "[event topic] probability likelihood [year]"
2. "[event topic] latest news"
3. "[event topic] surprise upset unexpected"
```

---

## Phase 3: Rank & Select

### Scoring Matrix

| Factor | Weight | Score 1 (bad) | Score 5 (good) |
|--------|--------|---------------|-----------------|
| Plausible catalyst exists | 30% | No catalyst in sight | Major event in <7 days |
| Base rate supports higher odds | 25% | Never happened / <0.1% | Has happened before / 5%+ base rate |
| Market is neglected (low attention) | 20% | High volume, efficient | Low volume, overlooked |
| Time to expiry | 15% | <3 days | 14-60 days |
| Exit liquidity exists | 10% | No bids above 1¢ | Bids at 2-3¢+ |

**Buy the top 5-10 scoring markets.**

---

## Phase 4: Position Sizing (Portfolio Approach)

This strategy is a PORTFOLIO, not individual trades. Size accordingly:

**Hard cap: $10 max per position.**

| Parameter | Value |
|-----------|-------|
| Max per-position | $10 |
| Max total strategy allocation | $50 |
| Target portfolio size | 5-10 positions |
| Cost per contract at 1-2¢ | $0.01-$0.02 |
| Contracts per position | 500-1000 (at 1¢ = $5-$10) |

### Expected Value Math
```
Buy 5 positions at 1¢ each, $10 per position = $50 total risk
If 1 out of 5 hits → pays $1.00 × ~1000 contracts = $1,000
Net: +$950 on $50 risked = 19x return

Break-even hit rate at 1¢ entry = 1%.
If actual probability is 3-5%, this is highly +EV.
```

---

## Phase 5: Entry & Exit

### Entry
- Use limit orders at 1-2¢ (never market buy — slippage kills the math)
- Be patient — place the order and let it fill over hours/days
- Don't chase above 3¢ unless thesis is strong

### Exit
- **Quick flip:** If price moves from 1¢ to 5-10¢ on news, sell half for 5-10x
- **Hold to resolution:** Keep remaining half for the 100x shot
- **Cut:** If catalyst passes without event, sell remaining at whatever bid exists
- **Never average up:** If it moves to 5¢, the risk/reward has changed

---

## Output Format

```
## LOTTERY TICKET PORTFOLIO

### Ticket 1: [TICKER]
**Market:** [Title]
**Price:** [X]¢ YES
**Expires:** [Date]
**Catalyst:** [What could make this hit]
**Base Rate:** [Historical probability of similar events]
**Position:** [N] contracts × [X]¢ = $[total]
**Score:** [X/5]

### Ticket 2: [TICKER]
...

### Portfolio Summary
- Total tickets: [N]
- Total cost: $[X]
- Break-even: [N] out of [total] need to hit
- Best case: $[max payout] ([Nx] return)
```
