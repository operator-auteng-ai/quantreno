# Kalshi Market Scan — Claude Helper Prompts

Pre-built tool call sequences for each strategy. Read the relevant section based on user command.

---

## Pre-Flight (always run first)

```
1. Check patch: run scripts/check-patch-status.sh
2. Portfolio context (run in parallel):
   - mcp__kalshi__get_balance
   - mcp__kalshi__get_positions (count_filter: "position")
   - mcp__kalshi__get_orders (status: "resting")
3. Local state check (run in parallel):
   - Bash: cd ~/projects/claude/state && uv run kalshi-state positions
   - Bash: cd ~/projects/claude/state && uv run kalshi-state trades --limit 10
4. X API available at: cd ~/projects/claude/x-search && uv run x-search
```

## X Search Integration (use during any Phase 2 research)

### Quick search (run via Bash tool)
```
cd ~/projects/claude/x-search && uv run x-search search "[topic] -is:retweet lang:en" -n 20
```

### Real-time stream presets
```
uv run x-search stream geopolitical   # Iran, Israel, regime change
uv run x-search stream oil            # Crude, OPEC, EIA, supply disruptions
uv run x-search stream fed            # FOMC, inflation, rate decisions
uv run x-search stream politics       # Government shutdown, Congress
uv run x-search stream breaking       # Breaking news
uv run x-search stream -q "[custom query] lang:en -is:retweet"  # Custom
```

### When to use X search vs WebSearch
- **X search**: Breaking news (fastest), real-time sentiment, expert commentary, insider signals
- **WebSearch**: Official data, detailed analysis, consensus estimates, institutional sources
- **Best practice**: Run both in parallel during Phase 2 research

---

## Full Scan ("Run the Kalshi market scan")

Read: `kalshi_sop.md` for the full workflow, then apply all 4 strategies below.

### Discovery (run all in parallel)
```
Tool: mcp__kalshi__get_trades (limit: 50)
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)
```

### Filter results through each strategy:
1. Read `strategies/oil.md` → filter for energy/commodity markets
2. Read `strategies/fat-tails.md` → filter for YES or NO <= 2¢
3. Read `strategies/volatility-swing.md` → filter for 24-72hr catalysts + volume spikes
4. Read `strategies/spread-arb.md` → filter for events with 3+ markets, check math

### Research top candidates → deep dive → recommend

---

## Oil Strategy ("Run the oil strategy")

Read: `strategies/oil.md`

### Scan
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)
  → Filter: tickers/titles containing oil, crude, WTI, Brent, gas, energy, petroleum

Tool: mcp__kalshi__get_trades (limit: 50)
  → Filter: oil/energy tickers
```

### Research (run in parallel)
```
Tool: WebSearch → "crude oil price today WTI Brent latest"
Tool: WebSearch → "EIA petroleum inventory report [this week]"
Tool: WebSearch → "OPEC production decision latest [month year]"
Tool: WebSearch → "[active geopolitical disruption] oil supply"
```

### Deep dive on targets
```
Tool: mcp__kalshi__get_market (ticker: "[TARGET]")
Tool: mcp__kalshi__get_orderbook (ticker: "[TARGET]")
```

---

## Fat Tails ("Find lottery tickets")

Read: `strategies/fat-tails.md`

### Scan
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)
  → Filter nested markets: yes_ask <= 3 OR no_ask <= 3
  → SKIP: zero volume, sports/entertainment
  → RANK by: has catalyst + time to expiry + base rate plausibility

Tool: mcp__kalshi__get_trades (limit: 50)
  → Filter: trades where yes_price <= 5 or (100 - yes_price) <= 5
```

### Research each candidate
```
Tool: WebSearch → "[event topic] probability likelihood [year]"
Tool: WebSearch → "[event topic] latest news surprise"
```

### Score using the Five Questions from fat-tails.md
### Build portfolio of top 5-10 tickets

---

## Volatility Swing ("Run the volatility swing")

Read: `strategies/volatility-swing.md`

### Scan
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)
  → Filter: settlement within 7 days, politics/economics/geopolitical
  → Prioritize: 24-72 hour catalysts

Tool: mcp__kalshi__get_trades (limit: 50)
  → Filter: same ticker 5+ times (hot), |price - previous| > 10 points
```

### Research (for each hot market)
```
Tool: WebSearch → "[event topic] latest news today"
Tool: WebSearch → "[event topic] [key date] what to expect"
```

### Deep dive
```
Tool: mcp__kalshi__get_market (ticker: "[TARGET]")
Tool: mcp__kalshi__get_orderbook (ticker: "[TARGET]")
Tool: mcp__kalshi__get_trades (ticker: "[TARGET]", limit: 30)
```

### Score using Swing Opportunity matrix from volatility-swing.md

---

## Spread Arbitrage ("Find spread opportunities")

Read: `strategies/spread-arb.md`

### Scan
```
Tool: mcp__kalshi__get_events (limit: 200, status: "open", with_nested_markets: true)
  → Filter: events with 3+ nested markets
  → For time-series: sort by expiration, calculate adjacent spreads
  → For range: sort by strike, verify monotonicity
  → For multi-outcome: sum all YES prices, check completeness
```

### Flag mispricings
```
For each event:
  - Calendar spreads: is the time premium between adjacent contracts reasonable?
  - Range spreads: are implied range probabilities consistent with consensus?
  - Multi-outcome: does the sum of YES prices ≈ 100¢?
  - Any non-monotonic prices? Any suspiciously wide/narrow spreads?
```

### Deep dive on flagged spreads
```
Tool: mcp__kalshi__get_market (ticker: "[LEG_1]")
Tool: mcp__kalshi__get_market (ticker: "[LEG_2]")
Tool: mcp__kalshi__get_orderbook (ticker: "[LEG_1]")
Tool: mcp__kalshi__get_orderbook (ticker: "[LEG_2]")

CRITICAL: Read rules_secondary for BOTH markets — settlement differences kill arbs
```

---

## Post-Trade State Logging (after every scan + execution)

### Log the scan
```
Bash: cd ~/projects/claude/state && uv run kalshi-state log-scan \
  --strategy [STRATEGY] --balance [BALANCE_CENTS] \
  --candidates [N] --recs [N] --notes "[summary]"
```

### Log each recommendation
```
Bash: cd ~/projects/claude/state && uv run kalshi-state log-rec \
  --strategy [STRATEGY] --ticker [TICKER] --side [yes/no] \
  --entry [PRICE] --target [TARGET] --confidence [high/medium/low] \
  --edge [POINTS] --thesis "[WHY]" --catalyst "[WHAT]" --catalyst-date "[WHEN]"
```

### Log each executed trade
```
Bash: cd ~/projects/claude/state && uv run kalshi-state log-trade \
  --strategy [STRATEGY] --ticker [TICKER] --side [yes/no] \
  --action [buy/sell] --price [CENTS] --count [N] --cost [DOLLARS] \
  --fees [FEES] --order-id "[ID]" --thesis "[WHY]" \
  --exit-plan "[PLAN]" --catalyst-date "[DATE]"
```

### Close a position (on exit)
```
Bash: cd ~/projects/claude/state && uv run kalshi-state close-position \
  --ticker [TICKER] --exit-price [CENTS] --pnl [DOLLARS]
```

### End-of-session snapshot
```
Bash: cd ~/projects/claude/state && uv run kalshi-state snapshot \
  --balance [BALANCE_CENTS] --positions [OPEN_COUNT] --unrealized [PNL_CENTS]
```

---

## Quick Commands

| Command | Strategy File | Scan Focus |
|---------|--------------|------------|
| "Run the Kalshi market scan" | All | Everything |
| "Run the oil strategy" | `strategies/oil.md` | Energy/commodity markets |
| "Find lottery tickets" | `strategies/fat-tails.md` | Markets at 1-2¢ |
| "Run the volatility swing" | `strategies/volatility-swing.md` | 24-72hr catalyst plays |
| "Find spread opportunities" | `strategies/spread-arb.md` | Multi-market math errors |
| "Analyze [TICKER]" | N/A | Single market deep dive |
| "How are my Kalshi positions?" | N/A | Position + P&L check |

## State Management Commands

| Command | What It Does |
|---------|-------------|
| `kalshi-state trades` | View all trade history |
| `kalshi-state trades --strategy oil` | Filter by strategy |
| `kalshi-state positions` | View open positions |
| `kalshi-state recs` | View recommendations |
| `kalshi-state scans` | View scan history |
| `kalshi-state performance` | Daily performance history |
| `kalshi-state performance --strategy [X]` | Win rate + P&L by strategy |
| `kalshi-state export trades.csv` | Export to CSV |

*All run from:* `cd ~/projects/claude/state && uv run [command]`
