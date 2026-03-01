# Architecture

> High-level architecture for the Kalshi Trading Agent SaaS.
> See [VISION.md](VISION.md) for product scope and pricing.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Inherited from Vercel chatbot fork |
| Hosting | Vercel Pro | Native Next.js support, cron, serverless |
| Database | Supabase Postgres | Managed Postgres, swaps Neon from chatbot |
| ORM | Drizzle | Already in chatbot, type-safe, migrations |
| Cache / Streams | Upstash Redis | Serverless Redis, stream resumability |
| Job Queue | Upstash QStash | HTTP-based fan-out for per-user cron jobs |
| File Storage | Vercel Blob | Already integrated in chatbot |
| Auth | NextAuth v5 | Already in chatbot, add OAuth providers |
| AI | Vercel AI SDK v6 | Multi-provider streaming, tool calling |
| Billing | Stripe | Subscriptions, trials, webhooks |
| Email | Resend | Transactional alerts, Vercel-native |
| UI | shadcn/ui + Tailwind | Already in chatbot |

---

## System Overview

```mermaid
graph TB
    subgraph Client ["Browser"]
        UI["Chat UI"]
    end

    subgraph Vercel ["Vercel"]
        MW["Middleware"]
        API["API Routes"]
        SA["Server Actions"]
        CRON["Vercel Cron"]
    end

    subgraph External ["External Services"]
        SUPA[("Supabase Postgres")]
        REDIS[("Upstash Redis")]
        QSTASH["Upstash QStash"]
        KALSHI["Kalshi REST API"]
        AIGATE["AI Gateway"]
        SEARCH["Web + X Search"]
        STRIPE["Stripe"]
        EMAIL["Resend"]
        BLOB["Vercel Blob"]
    end

    UI --> MW --> API
    UI --> SA
    API --> SUPA
    API --> REDIS
    API --> KALSHI
    API --> AIGATE
    API --> SEARCH
    API --> BLOB
    SA --> SUPA
    CRON --> API
    API --> QSTASH
    QSTASH --> API
    STRIPE --> API
    API --> EMAIL
```

---

## Request Flows

### Chat + Trade Execution

```mermaid
sequenceDiagram
    actor User
    participant UI as Chat UI
    participant API as /api/chat
    participant AI as AI SDK
    participant LLM as Claude/GPT
    participant Tools as Tool Layer
    participant Kalshi as Kalshi API
    participant DB as Supabase

    User->>UI: "Run the oil strategy"
    UI->>API: POST /api/chat (stream)
    API->>DB: Load chat history + user strategies
    API->>AI: streamText(messages, tools, systemPrompt)
    AI->>LLM: Prompt + tools schema
    LLM-->>AI: Tool call: getMarkets({strategy: "oil"})
    AI->>Tools: Execute getMarkets
    Tools->>Kalshi: GET /events, GET /markets
    Kalshi-->>Tools: Market data
    Tools-->>AI: Market results
    AI->>LLM: Market data + continue
    LLM-->>AI: Tool call: webSearch({query: "..."})
    AI->>Tools: Execute webSearch
    Tools->>Tools: Web + X search
    Tools-->>AI: Research results
    AI->>LLM: Research + continue
    LLM-->>AI: Text: recommendations
    AI-->>API: Stream response
    API-->>UI: SSE stream
    UI-->>User: Rendered recommendations

    User->>UI: "Trade the top two, $50 each"
    UI->>API: POST /api/chat (stream)
    API->>AI: streamText(messages, tools)
    AI->>LLM: Prompt
    LLM-->>AI: Tool call: createOrder({...})
    AI->>Tools: Execute createOrder
    Tools->>DB: Load user's Kalshi credentials (encrypted)
    Tools->>Kalshi: POST /orders
    Kalshi-->>Tools: Order confirmation
    Tools->>DB: Log trade + open position
    Tools-->>AI: Order result
    AI->>LLM: Confirmation + continue
    LLM-->>AI: Text: portfolio summary
    AI-->>API: Stream response
    API->>DB: Save assistant message
    API-->>UI: SSE stream
    UI-->>User: Order confirmation + portfolio
```

### Scheduled Position Checks (Cron + QStash)

```mermaid
sequenceDiagram
    participant Cron as Vercel Cron
    participant Dispatch as /api/jobs/dispatch
    participant DB as Supabase
    participant Kalshi as Kalshi API
    participant QStash as Upstash QStash
    participant Scanner as /api/jobs/scan-user/[id]
    participant AI as AI SDK
    participant Email as Resend

    Note over Cron: Fires on schedule per tier

    Cron->>Dispatch: GET /api/jobs/dispatch
    Dispatch->>DB: Get users with open positions (tier-filtered)
    Dispatch->>Kalshi: Batch: GET /markets (all active tickers)
    Kalshi-->>Dispatch: Current prices

    loop Each user
        Dispatch->>DB: Update position prices
        alt Price crossed threshold
            Dispatch->>Email: Send alert
            Dispatch->>DB: Log alert
        end
    end

    Dispatch->>DB: Get Premium users with active strategies
    loop Each Premium user + strategy
        Dispatch->>QStash: Enqueue /api/jobs/scan-user/[userId]
    end

    Note over QStash: Parallel fan-out

    QStash->>Scanner: POST /api/jobs/scan-user/123
    Scanner->>DB: Load user strategies + preferences
    Scanner->>Kalshi: GET /events (filtered by strategy)
    Scanner->>AI: Analyze candidates against strategy rules
    AI-->>Scanner: Recommendations
    Scanner->>DB: Store scan results + recommendations
    Scanner->>Email: Notify user of opportunities
```

### Auth + Billing

```mermaid
sequenceDiagram
    actor User
    participant UI as Chat UI
    participant Auth as NextAuth
    participant DB as Supabase
    participant Stripe as Stripe

    User->>UI: Sign up (Google OAuth)
    UI->>Auth: OAuth flow
    Auth->>DB: Create user (tier: trial)
    Auth-->>UI: JWT session

    User->>UI: Enter payment
    UI->>Stripe: Checkout session (7-day trial)
    Stripe-->>UI: Success
    Stripe->>API: Webhook: checkout.session.completed
    API->>DB: Update user tier = standard, stripeCustomerId

    Note over Stripe: 7 days later...

    Stripe->>API: Webhook: invoice.payment_succeeded
    API->>DB: Confirm subscription active

    Note over Stripe: If payment fails...

    Stripe->>API: Webhook: invoice.payment_failed
    API->>DB: Set tier = suspended
    API->>Email: Payment failed notification
```

---

## Database Schema

```mermaid
erDiagram
    User {
        uuid id PK
        varchar email UK
        varchar password "nullable (OAuth users)"
        varchar tier "trial | standard | premium | suspended"
        varchar stripeCustomerId "nullable"
        varchar stripeSubscriptionId "nullable"
        timestamp trialEndsAt "nullable"
        timestamp createdAt
    }

    Chat {
        uuid id PK
        uuid userId FK
        text title
        varchar visibility "private | public"
        timestamp createdAt
    }

    Message {
        uuid id PK
        uuid chatId FK
        varchar role "user | assistant | tool"
        json parts
        json attachments
        timestamp createdAt
    }

    Vote {
        uuid chatId FK
        uuid messageId FK
        boolean isUpvoted
    }

    KalshiCredential {
        uuid id PK
        uuid userId FK
        text apiKeyEncrypted
        text privateKeyEncrypted
        timestamp createdAt
        timestamp lastUsedAt
    }

    Strategy {
        uuid id PK
        uuid userId FK
        varchar name
        varchar slug UK
        json config "filters, entry/exit rules, sizing, sources"
        boolean isTemplate "true for built-in strategies"
        timestamp createdAt
        timestamp updatedAt
    }

    Trade {
        uuid id PK
        uuid userId FK
        uuid strategyId FK "nullable"
        varchar ticker
        varchar side "yes | no"
        varchar action "buy | sell"
        integer priceCents
        integer count
        integer costCents
        integer feesCents
        varchar kalshiOrderId
        text thesis
        timestamp createdAt
    }

    Position {
        uuid id PK
        uuid userId FK
        uuid tradeId FK "opening trade"
        uuid strategyId FK "nullable"
        varchar ticker
        varchar side "yes | no"
        integer entryPriceCents
        integer currentPriceCents
        integer count
        varchar status "open | closed"
        integer exitPriceCents "nullable"
        integer pnlCents "nullable"
        timestamp openedAt
        timestamp closedAt "nullable"
    }

    Recommendation {
        uuid id PK
        uuid userId FK
        uuid strategyId FK "nullable"
        varchar ticker
        varchar side "yes | no"
        integer entryPriceCents
        integer targetPriceCents
        varchar confidence "high | medium | low"
        text thesis
        text catalyst
        varchar status "pending | traded | skipped | expired"
        timestamp createdAt
    }

    Scan {
        uuid id PK
        uuid userId FK
        uuid strategyId FK "nullable"
        integer candidatesFound
        integer recommendationsMade
        text notes
        timestamp createdAt
    }

    PerformanceSnapshot {
        uuid id PK
        uuid userId FK
        integer balanceCents
        integer portfolioValueCents
        integer openPositions
        integer realizedPnlCents
        integer totalTrades
        integer wins
        integer losses
        timestamp createdAt
    }

    Alert {
        uuid id PK
        uuid userId FK
        uuid positionId FK "nullable"
        varchar type "threshold | opportunity | fill | settlement"
        text message
        varchar channel "email | in_app"
        boolean delivered
        timestamp createdAt
    }

    User ||--o{ Chat : has
    User ||--o{ KalshiCredential : has
    User ||--o{ Strategy : owns
    User ||--o{ Trade : executes
    User ||--o{ Position : holds
    User ||--o{ Recommendation : receives
    User ||--o{ Scan : runs
    User ||--o{ PerformanceSnapshot : tracks
    User ||--o{ Alert : receives
    Chat ||--o{ Message : contains
    Chat ||--o{ Vote : has
    Message ||--o| Vote : rated
    Strategy ||--o{ Trade : informs
    Strategy ||--o{ Position : informs
    Strategy ||--o{ Recommendation : generates
    Strategy ||--o{ Scan : scoped_to
    Trade ||--|| Position : opens
    Position ||--o{ Alert : triggers
```

### Inherited Tables (from Vercel Chatbot)

The chatbot ships with `User`, `Chat`, `Message` (as `Message_v2`), `Vote` (as `Vote_v2`), `Document`, `Suggestion`, and `Stream` tables. We keep all of them and extend `User` with billing/tier fields. The trading tables above are additive.

---

## AI Tools

The AI agent has access to tools via the Vercel AI SDK `tools` parameter. Each tool is a Zod-validated function executed server-side.

```mermaid
graph LR
    subgraph Inherited ["Inherited from Chatbot"]
        T1[createDocument]
        T2[updateDocument]
        T3[requestSuggestions]
    end

    subgraph Trading ["New: Trading"]
        T4["getMarkets"]
        T5["getPositions"]
        T6["createOrder"]
        T7["cancelOrder"]
    end

    subgraph Research ["New: Research"]
        T8["webSearch"]
        T9["xSearch"]
    end

    subgraph Strategy ["New: Strategy"]
        T10["listStrategies"]
        T11["runStrategy"]
        T12["saveStrategy"]
    end

    subgraph Portfolio ["New: Portfolio"]
        T13["getPortfolio"]
        T14["getTradeHistory"]
    end
```

### Tool Execution Security

- Trading tools (`createOrder`, `cancelOrder`) require user confirmation before execution — the LLM proposes, the user approves.
- Kalshi credentials are decrypted server-side per-request, never cached in memory.
- All tool calls are logged to the `Message` table with `role: "tool"`.

---

## Strategy Engine

```mermaid
graph TB
    subgraph Input
        NL["User natural language"]
        TPL["Built-in template"]
    end

    subgraph Processing
        AI["AI structures into config"]
        VAL["Validate against JSON schema"]
    end

    subgraph StrategyConfig ["Strategy Config - JSON"]
        F["filters"]
        E["entry_rules"]
        X["exit_rules"]
        S["sizing"]
        R["research"]
        TH["thesis_template"]
    end

    subgraph Execution
        SCAN["Market Scan"]
        RES["Research Phase"]
        RANK["Rank + Recommend"]
        TRADE["User approves + Execute"]
    end

    NL --> AI --> VAL --> StrategyConfig
    TPL --> VAL
    StrategyConfig --> SCAN --> RES --> RANK --> TRADE
```

---

## Cron Schedule

```mermaid
gantt
    title Daily Cron Schedule (ET)
    dateFormat HH:mm
    axisFormat %H:%M

    section Standard
    Position check 1     :09:00, 1m
    Position check 2     :11:00, 1m
    Position check 3     :13:00, 1m
    Position check 4     :15:00, 1m
    Position check 5     :17:00, 1m
    Daily snapshot        :22:00, 1m

    section Premium
    Hourly check + scan  :00:00, 1m
    Hourly check + scan  :01:00, 1m
    Hourly check + scan  :02:00, 1m
    Hourly check + scan  :03:00, 1m
    (continues hourly)   :04:00, 20h
    Daily snapshot        :22:00, 1m
```

### vercel.json cron config

```json
{
  "crons": [
    {
      "path": "/api/jobs/dispatch?tier=standard",
      "schedule": "0 9,11,13,15,17 * * 1-5"
    },
    {
      "path": "/api/jobs/dispatch?tier=premium",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/jobs/daily-snapshot",
      "schedule": "0 22 * * *"
    }
  ]
}
```

---

## Key Architecture Decisions

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| Monolith vs microservices | Next.js monolith | Separate backend API — unnecessary complexity for V1 |
| Auth | Keep NextAuth, add OAuth | Supabase Auth — not needed since we use Drizzle ORM directly |
| Cron scalability | QStash fan-out for AI-heavy jobs | BullMQ worker — requires persistent process, not serverless-friendly |
| Kalshi integration | Direct REST API calls in tool layer | MCP server — adds npx dependency, patching issues in prod |
| Credential storage | Encrypted in Supabase, decrypt per-request | Vault/KMS — overkill for V1, can migrate later |
| Hosting | Vercel | AWS (ECS/Fargate) — weeks of setup, $200+/mo, migrate when needed |
