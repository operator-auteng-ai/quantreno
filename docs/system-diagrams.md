# Kalshi Trading System — Architecture & Flow Diagrams

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Paul)                                 │
│  "Run the oil strategy"  "Find lottery tickets"  "Make the trades"  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CLAUDE AGENT                                  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │  kalshi_sop   │  │  market-scan.md  │  │  strategies/*.md      │ │
│  │  (playbook)   │  │  (tool sequences)│  │  oil | fat-tails      │ │
│  │              │  │                  │  │  vol-swing | spread    │ │
│  └──────┬───────┘  └────────┬─────────┘  └───────────┬───────────┘ │
│         └──────────────┬────┘                         │             │
│                        ▼                              │             │
│         ┌──────────────────────────┐                  │             │
│         │   7-Phase Trade Engine   │◄─────────────────┘             │
│         └─────┬──────┬──────┬─────┘                                │
│               │      │      │                                       │
└───────────────┼──────┼──────┼───────────────────────────────────────┘
                │      │      │
       ┌────────┘      │      └────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Kalshi MCP │ │   X Search  │ │ kalshi-state │
│  (Markets)  │ │  (Sentiment)│ │   (SQLite)   │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ get_balance │ │ search      │ │ log-trade    │
│ get_events  │ │ stream      │ │ log-rec      │
│ get_market  │ │   presets:  │ │ log-scan     │
│ get_orderbook│ │  geopolitical│ │ positions   │
│ get_trades  │ │  oil        │ │ close-pos    │
│ get_positions│ │  fed        │ │ snapshot     │
│ create_order│ │  politics   │ │ performance  │
│ cancel_order│ │  breaking   │ │ export       │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Kalshi API │ │   X API v2  │ │  SQLite DB   │
│  (REST)     │ │  (xdk SDK)  │ │  kalshi.db   │
│             │ │             │ │              │
│ Prediction  │ │ Real-time   │ │ 5 tables:    │
│ market data │ │ posts &     │ │ trades       │
│ + orders    │ │ streams     │ │ positions    │
└─────────────┘ └─────────────┘ │ recs         │
                                │ scans        │
                                │ performance  │
                                └─────────────┘
```

---

## 2. Trade Lifecycle — Full Sequence

```
 User          Claude Agent         Kalshi MCP        X Search       kalshi-state
  │                │                    │                │                │
  │ "Run the oil   │                    │                │                │
  │  strategy"     │                    │                │                │
  │───────────────>│                    │                │                │
  │                │                    │                │                │
  │                │ ── PRE-FLIGHT ──── │                │                │
  │                │  get_balance ──────>│                │                │
  │                │  get_positions ────>│                │                │
  │                │  get_orders ──────>│                │                │
  │                │                    │                │  positions ───>│
  │                │                    │                │  trades ──────>│
  │                │                    │                │                │
  │                │ ── PHASE 1: DISCOVERY ──            │                │
  │                │  get_trades(50) ───>│                │                │
  │                │  get_events(200) ──>│                │                │
  │                │   (filter for oil   │                │                │
  │                │    keywords)        │                │                │
  │                │                    │                │                │
  │                │ ── PHASE 2: RESEARCH ── (parallel)  │                │
  │                │  WebSearch("oil")──>│                │                │
  │                │  WebSearch("EIA")──>│                │                │
  │                │                    │  search ──────>│                │
  │                │                    │  "Hormuz oil"  │                │
  │                │                    │                │                │
  │                │ ── PHASE 3: ANALYSIS ──             │                │
  │                │  get_market(T) ────>│                │                │
  │                │  get_orderbook(T) ─>│                │                │
  │                │   (calc edge)       │                │                │
  │                │                    │                │                │
  │                │ ── PHASE 4+5: SIZE ──               │                │
  │                │   (apply Kelly,     │                │                │
  │                │    cap at $10)      │                │                │
  │                │                    │                │                │
  │ Recommendation │                    │                │                │
  │<───────────────│                    │                │                │
  │                │                    │                │                │
  │ "Make the      │                    │                │                │
  │  trades"       │                    │                │                │
  │───────────────>│                    │                │                │
  │                │                    │                │                │
  │                │ ── PHASE 6: EXECUTE ──              │                │
  │                │                    │                │  log-rec ─────>│
  │                │  create_order ─────>│                │                │
  │                │        order_id <───│                │                │
  │                │                    │                │  log-trade ───>│
  │                │                    │                │  (auto-opens   │
  │                │                    │                │   position)    │
  │                │                    │                │                │
  │ "Trade placed" │                    │                │                │
  │<───────────────│                    │                │                │
  │                │                    │                │                │
  │                │ ── PHASE 7: MONITOR (later) ──      │                │
  │                │  get_positions ────>│                │                │
  │                │  get_market(T) ────>│  search ──────>│                │
  │                │                    │                │                │
  │                │ ── ON EXIT ──       │                │                │
  │                │  create_order ─────>│                │                │
  │                │   (sell)    id <────│                │  close-pos ──>│
  │                │                    │                │                │
  │                │ ── END SESSION ──   │                │                │
  │                │  get_balance ──────>│                │  log-scan ───>│
  │                │                    │                │  snapshot ───>│
  │                │                    │                │                │
```

---

## 3. Strategy Router — Command Flow

```
                        User Command
                             │
                             ▼
              ┌──────────────────────────┐
              │   Which command?          │
              └──────────┬───────────────┘
                         │
        ┌────────┬───────┼───────┬────────┐
        ▼        ▼       ▼       ▼        ▼
   ┌────────┐┌───────┐┌──────┐┌───────┐┌───────┐
   │ "Run   ││"Run   ││"Find ││"Run   ││"Find  │
   │ Kalshi ││ the   ││lottery││ the   ││spread │
   │ market ││ oil   ││ticket ││volatil││opport-│
   │ scan"  ││strat" ││s"    ││ity    ││unities│
   └───┬────┘└───┬───┘└──┬───┘│swing" │└───┬───┘
       │         │       │    └───┬───┘    │
       │         │       │        │        │
       ▼         ▼       ▼        ▼        ▼
   ┌────────────────────────────────────────────┐
   │              PRE-FLIGHT                     │
   │  patch check + balance + positions + state  │
   └──────────────────┬─────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
  ┌─────────┐  ┌───────────┐  ┌──────────┐
  │Phase 1  │  │ Read       │  │Phase 1   │
  │Discovery│  │ strategy   │  │Discovery │
  │(ALL     │  │ file only  │  │(targeted)│
  │events)  │  │            │  │          │
  └────┬────┘  └─────┬─────┘  └────┬─────┘
       │             │              │
       ▼             ▼              ▼
  ┌─────────────────────────────────────┐
  │  FILTER through strategy logic       │
  │                                      │
  │  Oil:     energy tickers + catalysts │
  │  Fat tail: price <= 2-3¢ + catalyst  │
  │  Swing:   24-72h catalyst + volume   │
  │  Spread:  3+ markets, check math     │
  └──────────────────┬──────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ PHASE 2-5       │
            │ Research → Anal │
            │ → Mispricing →  │
            │ Position Sizing │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ RECOMMENDATION  │
            │ to user         │
            └────────┬────────┘
                     │
              user approves
                     │
                     ▼
            ┌─────────────────┐
            │ PHASE 6: EXECUTE│
            │ log-rec → order │
            │ → log-trade     │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ PHASE 7: MONITOR│
            │ + log-scan      │
            │ + snapshot      │
            └─────────────────┘
```

---

## 4. State Machine — Position Lifecycle

```
                    ┌─────────────────┐
                    │  RECOMMENDATION  │
                    │  status: pending │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  traded   │  │  skipped  │  │  expired  │
        └─────┬────┘  └──────────┘  └──────────┘
              │
              ▼
        ┌──────────┐     create_order()      ┌──────────┐
        │  TRADE    │ ─────────────────────── │  Kalshi   │
        │  status:  │     order_id            │  API      │
        │  executed │ <────────────────────── │           │
        └─────┬────┘                          └──────────┘
              │
              │  log_trade() auto-creates
              ▼
        ┌──────────────────┐
        │    POSITION       │
        │    status: open   │
        │                   │
        │  ticker           │
        │  entry_price      │
        │  count            │
        │  thesis           │
        │  exit_plan        │
        └────────┬─────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
   ┌────────┐┌───────┐┌───────┐
   │ Take   ││ Cut   ││Expired│
   │ Profit ││ Loss  ││       │
   │ (>90¢) ││(thesis││(settl-│
   │        ││broken)││ement) │
   └───┬────┘└───┬───┘└───┬───┘
       └─────────┼────────┘
                 │
                 ▼
        ┌──────────────────┐
        │    POSITION       │
        │    status: closed │
        │                   │
        │  exit_price       │
        │  pnl_cents        │
        │  pnl_dollars      │
        │  closed_at        │
        └──────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │   PERFORMANCE     │
        │   snapshot        │
        │                   │
        │  win_count++      │
        │  or loss_count++  │
        │  realized_pnl +=  │
        └──────────────────┘
```

---

## 5. Data Flow — SQLite State Persistence

```
SESSION START
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  READ state from previous sessions                          │
│                                                             │
│  kalshi-state positions  ──── SELECT * FROM positions       │
│                                WHERE status = 'open'        │
│                                                             │
│  kalshi-state trades     ──── SELECT * FROM trades          │
│                                ORDER BY created_at DESC     │
│                                                             │
│  kalshi-state performance ─── SELECT * FROM performance     │
│                                ORDER BY date DESC           │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  SCAN PHASE     │
                         │  (Kalshi API +  │
                         │   X Search +    │
                         │   WebSearch)    │
                         └────────┬────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  WRITE: log-scan                                            │
│                                                             │
│  INSERT INTO scans (strategy, balance_cents,                │
│    candidates_found, recommendations_made, notes)           │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  WRITE: log-rec (for each recommendation)                   │
│                                                             │
│  INSERT INTO recommendations (strategy, ticker, side,       │
│    entry_price, target_price, confidence, edge_points,      │
│    thesis, catalyst, catalyst_date, status='pending')       │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                           order placed via MCP
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  WRITE: log-trade (for each executed trade)                 │
│                                                             │
│  INSERT INTO trades (strategy, ticker, side, action,        │
│    price, count, total_cost, order_id, fees)                │
│                                                             │
│  IF action = 'buy':                                         │
│    INSERT INTO positions (trade_id, strategy, ticker,       │
│      side, entry_price, count, thesis, exit_plan,           │
│      status='open')                                         │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                          ... time passes ...
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  WRITE: close-position (on exit)                            │
│                                                             │
│  UPDATE positions SET status='closed',                      │
│    closed_at=datetime('now'), exit_price=?,                 │
│    pnl_cents=?, pnl_dollars=?                               │
│  WHERE ticker=? AND status='open'                           │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  WRITE: snapshot (end of session)                           │
│                                                             │
│  SELECT COUNT, SUM(pnl) FROM positions WHERE status='closed'│
│                                                             │
│  INSERT INTO performance (date, balance_cents,              │
│    open_positions, unrealized_pnl_cents,                    │
│    realized_pnl_cents, total_trades, win_count, loss_count) │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Research Phase — Parallel Source Triangulation

```
              Candidate Market Identified
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
     ┌────────────┐┌──────────┐┌───────────┐
     │  LAYER 1   ││ LAYER 2  ││  LAYER 3  │
     │  X Search  ││ WebSearch││  WebSearch │
     │  (Minutes) ││ (15-60m) ││  (Hours+)  │
     ├────────────┤├──────────┤├───────────┤
     │ Journalists││ Reuters  ││ Fed.gov   │
     │ Experts    ││ AP       ││ congress  │
     │ Insiders   ││ Bloomberg││ .gov      │
     │ First-hand ││ CNBC     ││ BLS data  │
     │ accounts   ││          ││ EIA data  │
     └─────┬──────┘└─────┬────┘└─────┬─────┘
           │             │           │
           ▼             ▼           ▼
     ┌─────────────────────────────────────┐
     │      TRIANGULATION                   │
     │                                      │
     │  X says it     News confirms    Official
     │  first    ───> with detail ───> data locks
     │                                 it in
     │                                      │
     │  Disagreement? ──> RED FLAG          │
     │  All agree?    ──> HIGH CONFIDENCE   │
     └──────────────────┬──────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ PROBABILITY      │
              │ ESTIMATE         │
              │                  │
              │ My estimate: X%  │
              │ Market says: Y%  │
              │ Edge: |X - Y|    │
              └──────────────────┘
```

---

## 7. Current Portfolio State (Feb 28, 2026)

```
┌─────────────────────────────────────────────────────────────────┐
│  PORTFOLIO SNAPSHOT                                             │
│  Balance: $928.73 cash | $74.99 portfolio | 4 positions         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POSITION 1: KXKHAMENEIOUT-AKHA-26APR01                        │
│  ├─ Strategy: volatility-swing                                  │
│  ├─ Direction: YES × 50 @ 39¢                                  │
│  ├─ Cost: $19.50 + $0.84 fees                                  │
│  ├─ Thesis: Iran strikes → regime destabilization               │
│  └─ Status: OPEN ● filled                                      │
│                                                                 │
│  POSITION 2: KXKHAMENEIOUT-AKHA-26JUL01                        │
│  ├─ Strategy: volatility-swing                                  │
│  ├─ Direction: YES × 88 @ 57¢                                  │
│  ├─ Cost: $50.16 + $1.54 fees                                  │
│  ├─ Thesis: Iran strikes → longer-dated regime change           │
│  └─ Status: OPEN ● filled                                      │
│                                                                 │
│  POSITION 3: KXCPI-26MAR-T0.4                                  │
│  ├─ Strategy: oil                                               │
│  ├─ Direction: YES × 833 @ 12¢                                 │
│  ├─ Cost: $99.96 target                                        │
│  ├─ Thesis: Oil shock → March CPI > 0.4%                       │
│  ├─ Filled: 50/833 (6%)                                        │
│  └─ Status: OPEN ◐ resting (783 remaining)                     │
│                                                                 │
│  POSITION 4: KXFED-26JUN-T3.50                                 │
│  ├─ Strategy: volatility-swing                                  │
│  ├─ Direction: YES × 212 @ 47¢                                 │
│  ├─ Cost: $99.64 target                                        │
│  ├─ Thesis: Oil inflation → Fed can't cut to 3.50% by June     │
│  ├─ Filled: 1/212 (0.5%)                                       │
│  └─ Status: OPEN ◐ resting (211 remaining)                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  THESIS MAP                                                     │
│                                                                 │
│  US strikes Iran ─── CONFIRMED (Feb 28)                         │
│       │                                                         │
│       ├──► Hormuz closed ─── CONFIRMED (IRGC "no ships")       │
│       │         │                                               │
│       │         ├──► Oil +12% after-hours                       │
│       │         │         │                                     │
│       │         │         ├──► CPI Mar > 0.4% ← TRADE 3        │
│       │         │         │                                     │
│       │         │         └──► Fed frozen ← TRADE 4             │
│       │         │                                               │
│       │         └──► Japan panic → carry trade unwind           │
│       │                    │                                    │
│       │                    └──► Global margin call               │
│       │                              │                          │
│       │                              └──► Credit event           │
│       │                                                         │
│       ├──► Regime destabilization ← TRADES 1 & 2                │
│       │                                                         │
│       └──► Khamenei out ← TRADES 1 & 2                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Database Entity Relationship Diagram

```
┌─────────────────────┐
│    recommendations   │
├─────────────────────┤
│ id (PK)             │
│ created_at          │
│ strategy            │
│ ticker              │
│ side                │
│ entry_price         │
│ target_price        │
│ confidence          │
│ edge_points         │
│ my_probability      │
│ market_probability  │
│ thesis              │
│ catalyst            │
│ catalyst_date       │
│ status              │◄──── pending → traded / skipped / expired
└────────┬────────────┘
         │ 1
         │
         │ 0..1
         ▼
┌─────────────────────┐
│      trades          │
├─────────────────────┤
│ id (PK)             │
│ created_at          │
│ recommendation_id(FK)│───► recommendations.id
│ strategy            │
│ ticker              │
│ side                │
│ action              │◄──── buy / sell
│ order_type          │
│ price               │
│ count               │
│ total_cost          │
│ order_id            │───► Kalshi API order ID
│ status              │◄──── executed / resting / cancelled
│ fees                │
└────────┬────────────┘
         │ 1
         │
         │ 0..1 (created on buy)
         ▼
┌─────────────────────┐
│     positions        │
├─────────────────────┤
│ id (PK)             │
│ opened_at           │
│ closed_at           │
│ trade_id (FK)       │───► trades.id
│ strategy            │
│ ticker              │
│ side                │
│ entry_price         │
│ exit_price          │
│ count               │
│ thesis              │
│ exit_plan           │
│ catalyst_date       │
│ status              │◄──── open → closed / expired
│ pnl_cents           │
│ pnl_dollars         │
└─────────────────────┘

┌─────────────────────┐      ┌─────────────────────┐
│       scans          │      │    performance       │
├─────────────────────┤      ├─────────────────────┤
│ id (PK)             │      │ id (PK)             │
│ created_at          │      │ date                │
│ strategy            │      │ balance_cents       │
│ balance_cents       │      │ open_positions      │
│ open_positions      │      │ unrealized_pnl_cents│
│ markets_scanned     │      │ realized_pnl_cents  │
│ candidates_found    │      │ total_trades        │
│ recommendations_made│      │ win_count           │
│ notes               │      │ loss_count          │
└─────────────────────┘      └─────────────────────┘
     (per scan)                   (per session)
```

---

*Generated Feb 28, 2026 — reflects all 4 active positions and the oil cascade thesis.*
