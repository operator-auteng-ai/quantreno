# Infrastructure

> Deployment and service configuration for the SaaS trading platform.
> See [ARCH.md](ARCH.md) for system architecture, [VISION.md](VISION.md) for product scope.

---

## Service Map

| Service | Plan | Monthly Cost | Purpose |
|---------|------|-------------|---------|
| **Vercel** | Pro | $20 | Next.js hosting, serverless functions, cron, CI/CD |
| **Supabase** | Pro | $25 | Postgres database, storage |
| **Upstash Redis** | Pay-as-you-go | ~$10 | Stream resumability, caching |
| **Upstash QStash** | Pay-as-you-go | ~$1 | Fan-out job queue for per-user cron |
| **Stripe** | Standard | 2.9% + 30¢/txn | Subscriptions, trials, billing |
| **Resend** | Free (3k/mo) → Pro | $0-20 | Transactional email alerts |
| **AI Providers** | Pay-per-token | ~$15-60/mo at 30 users | Claude, GPT, Gemini via AI Gateway |
| **Domain** | - | ~$12/yr | Custom domain |
| **Total (launch)** | | **~$75/mo + AI** | Before meaningful user load |

---

## Vercel

### Project Setup

```
Fork vercel/chatbot → our repo
Connect repo to Vercel project
Framework: Next.js (auto-detected)
Build command: pnpm run build (runs migrations + next build)
Output directory: .next
Node.js version: 20.x
Install command: pnpm install
```

### Function Configuration

| Route | Runtime | Max Duration | Notes |
|-------|---------|-------------|-------|
| `/api/chat` | Node.js | 60s | Streaming chat — inherits chatbot's config |
| `/api/jobs/dispatch` | Node.js | 60s | Batch position checks + QStash fan-out |
| `/api/jobs/scan-user/[id]` | Node.js | 60s | Per-user AI strategy scan (called by QStash) |
| `/api/jobs/daily-snapshot` | Node.js | 60s | End-of-day P&L snapshot |
| All other routes | Node.js | 10s (default) | Standard CRUD operations |

### Cron Jobs

Defined in `vercel.json`:

| Schedule | Path | Tier | Description |
|----------|------|------|-------------|
| `0 9,11,13,15,17 * * 1-5` | `/api/jobs/dispatch?tier=standard` | Standard | 5x/day weekdays during market hours ET |
| `0 * * * *` | `/api/jobs/dispatch?tier=premium` | Premium | Every hour, 24/7 |
| `0 22 * * *` | `/api/jobs/daily-snapshot` | All | Nightly performance snapshot |

Security: Vercel auto-injects `CRON_SECRET` as `Authorization: Bearer` header. Routes verify this before processing.

### Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` | NextAuth JWT signing secret |
| `POSTGRES_URL` | Supabase dashboard → Connection string | Supabase Postgres connection |
| `REDIS_URL` | Upstash console | Upstash Redis connection |
| `QSTASH_TOKEN` | Upstash console | QStash API token for job publishing |
| `QSTASH_CURRENT_SIGNING_KEY` | Upstash console | Verify incoming QStash requests |
| `QSTASH_NEXT_SIGNING_KEY` | Upstash console | Key rotation support |
| `AI_GATEWAY_API_KEY` | Vercel dashboard | AI Gateway key (or auto via OIDC on Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage | Vercel Blob credentials |
| `STRIPE_SECRET_KEY` | Stripe dashboard | Server-side Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks | Verify Stripe webhook signatures |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard | Client-side Stripe.js |
| `RESEND_API_KEY` | Resend dashboard | Transactional email sending |
| `KALSHI_ENCRYPTION_KEY` | Generate: `openssl rand -hex 32` | AES-256 key for encrypting user Kalshi credentials |
| `TAVILY_API_KEY` | [tavily.com](https://tavily.com) | Web search for catalyst research (free: 1,000 searches/mo) |
| `X_BEARER_TOKEN` | [developer.x.com](https://developer.x.com) | X API v2 bearer token for tweet sentiment search |
| `CRON_SECRET` | Auto-set by Vercel | Cron job authentication |
| `NEXT_PUBLIC_APP_URL` | Set manually | Base URL for QStash callback targets |

### Domains

```
Production: app.example.com (or similar)
Preview: auto-generated per PR (*.vercel.app)
```

### Vercel Pro Limits (relevant)

| Resource | Limit |
|----------|-------|
| Serverless function duration | 60s max |
| Serverless function memory | 1024 MB default, 3008 MB max |
| Cron jobs per project | 100 |
| Cron minimum interval | 1 minute |
| Bandwidth | 1 TB/mo |
| Builds | 6000/mo |
| Concurrent builds | 1 (Pro) |

---

## Supabase

### Project Setup

```
Region: us-east-1 (closest to Vercel's default)
Plan: Pro ($25/mo)
Postgres version: 15+
```

### Database

- **Connection:** Direct connection string via `POSTGRES_URL` env var
- **ORM:** Drizzle (not Supabase client SDK) — no RLS needed
- **Migrations:** Drizzle Kit (`pnpm db:migrate`) — runs as part of Vercel build
- **Schema:** 12 tables (see ARCH.md for full ER diagram)
  - Inherited from chatbot: User, Chat, Message_v2, Vote_v2, Document, Suggestion, Stream
  - New trading tables: KalshiCredential, Strategy, Trade, Position, Recommendation, Scan, PerformanceSnapshot, Alert

### Connection Pooling

Supabase Pro includes PgBouncer connection pooling:
- **Transaction mode** for serverless (short-lived connections from Vercel functions)
- Use the pooled connection string (`?pgbouncer=true`) in `POSTGRES_URL`

### Backups

- Supabase Pro: daily automated backups, 7-day retention
- Point-in-time recovery available on Pro plan

### Supabase Pro Limits (relevant)

| Resource | Limit |
|----------|-------|
| Database size | 8 GB included |
| Bandwidth | 250 GB/mo |
| Storage | 100 GB |
| Concurrent connections | 200 (via pooler) |
| Daily backups | 7-day retention |

---

## Upstash Redis

### Setup

```
Region: us-east-1 (match Vercel + Supabase)
Plan: Pay-as-you-go
Eviction: noeviction
TLS: enabled
```

### Usage

| Use Case | Key Pattern | TTL |
|----------|-------------|-----|
| Stream resumability | `stream:{chatId}:{streamId}` | 24h |
| Rate limiting (future) | `ratelimit:{userId}:{window}` | Per-window |

### Upstash Limits

| Resource | Limit |
|----------|-------|
| Max commands/day (free) | 10,000 |
| Max commands/day (pay-as-you-go) | Unlimited |
| Max data size | 256 MB (pay-as-you-go) |
| Price | $0.2/100K commands |

---

## Upstash QStash

### Setup

```
Plan: Pay-as-you-go ($1/100K messages)
Callback base URL: https://app.example.com
```

### Usage

The dispatch cron route publishes messages to QStash, which delivers them to per-user scan endpoints:

| Message Target | When | Payload |
|---------------|------|---------|
| `/api/jobs/scan-user/[userId]` | Cron dispatch (Premium users) | `{ userId, strategyId, tier }` |

### Security

- **Publishing:** Authenticated via `QSTASH_TOKEN`
- **Receiving:** Verify signature using `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`
- QStash provides automatic retries (3 attempts, exponential backoff)

---

## Stripe

### Setup

```
Mode: Live (test mode for development)
Products:
  - Standard Plan: $100/mo, 7-day free trial
  - Premium Plan: $500/mo, 7-day free trial
Payment method: Credit card required upfront
Trial: 7 days, full Standard access
```

### Webhooks

Register webhook endpoint: `https://app.example.com/api/webhooks/stripe`

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription, set user tier |
| `invoice.payment_succeeded` | Confirm active, extend access |
| `invoice.payment_failed` | Send payment failure email, grace period |
| `customer.subscription.updated` | Handle plan changes (upgrade/downgrade) |
| `customer.subscription.deleted` | Set tier to suspended, disable trading |

### Customer Portal

Stripe Customer Portal for self-service:
- Update payment method
- View invoices
- Cancel subscription
- Switch plans

---

## Resend

### Setup

```
Domain: example.com (verify DNS)
From address: alerts@example.com
Plan: Free (3,000 emails/mo) — upgrade when needed
```

### Email Types

| Template | Trigger | Priority |
|----------|---------|----------|
| Welcome | User signup | Normal |
| Trial ending | 2 days before trial expiry | Normal |
| Payment failed | Stripe webhook | High |
| Position alert | Price threshold crossed | High |
| Opportunity found | Strategy scan found match | Normal |
| Daily digest | End-of-day snapshot (opt-in) | Low |

---

## AI Gateway

### Provider Configuration

The Vercel AI SDK Gateway proxies requests to multiple AI providers. On Vercel deployments, OIDC tokens are auto-generated — no per-provider API keys needed.

| Provider | Models Used | Use Case |
|----------|------------|----------|
| Anthropic | Claude Sonnet 4.5, Haiku 4.5 | Primary chat, artifact generation |
| Google | Gemini 2.5 Flash Lite | Title generation, lightweight tasks |
| OpenAI | GPT-4.1 Mini | Fallback option |

### Cost Estimation

| Scenario | Est. Tokens/Day | Est. Cost/Day |
|----------|----------------|---------------|
| Light user (5 msgs) | ~50K | $0.15 |
| Active user (20 msgs + research) | ~200K | $0.60 |
| Power user (50 msgs + full scans) | ~500K | $1.50 |
| Cron scan (per user, per run) | ~30K | $0.09 |

At 30 Standard users: ~$18-45/day AI cost = $540-1,350/mo
Revenue at 30 Standard: $3,000/mo — healthy margin.

---

## Deployment Pipeline

### Git-Based CI/CD (Vercel default)

```
Push to main → Vercel builds → Runs migrations → Deploys to production
Push to PR branch → Vercel builds → Preview deployment (unique URL)
```

### Pre-Deployment Checklist (launch)

1. Fork vercel/chatbot repo
2. Create Vercel project, connect repo
3. Create Supabase project (us-east-1)
4. Create Upstash Redis + QStash instances
5. Create Stripe account + products/prices
6. Set up Resend domain verification
7. Configure all environment variables in Vercel
8. Run initial database migration
9. Configure Stripe webhook endpoint
10. Set up custom domain + SSL (automatic via Vercel)
11. Verify cron jobs firing correctly
12. Test end-to-end: signup → trial → chat → trade → cron → alert

### Environments

| Environment | Branch | Database | Stripe | Purpose |
|-------------|--------|----------|--------|---------|
| Production | `main` | Supabase prod project | Live mode | Real users |
| Preview | PR branches | Supabase dev project | Test mode | PR review |
| Local | - | Supabase local (CLI) | Test mode | Development |

---

## Monitoring & Observability

### Built-In (Vercel)

- **Vercel Analytics** — page views, web vitals (inherited from chatbot)
- **Vercel Logs** — serverless function logs, errors, cold starts
- **Vercel Speed Insights** — performance monitoring
- **OpenTelemetry** — `@vercel/otel` already configured in chatbot

### Supabase

- **Dashboard** — query performance, connection count, storage usage
- **Log Explorer** — Postgres logs, auth events

### Alerts to Set Up

| Alert | Source | Threshold |
|-------|--------|-----------|
| Function errors spike | Vercel | >5% error rate |
| Database connections high | Supabase | >150/200 |
| Cron job failure | Vercel logs | Any failure |
| Stripe webhook failure | Stripe dashboard | Any 4xx/5xx |
| AI cost daily | AI Gateway usage | >$50/day |

---

## Scaling Path

When we outgrow Vercel (function duration limits, cost at scale, need for long-running processes):

| Trigger | Migration Path |
|---------|---------------|
| >60s function duration needed | Vercel Functions Pro (300s) or move chat route to AWS Lambda |
| >$500/mo Vercel bill | Evaluate AWS ECS Fargate + CloudFront |
| Need persistent WebSocket | Add dedicated WebSocket server on Fly.io or Railway |
| >500 concurrent users | Supabase Enterprise or self-managed RDS |
| Compliance requirements | Full AWS deployment with Terraform (VPC, WAF, etc.) |

This is a V2+ concern. The Vercel stack handles the first 500+ users comfortably.
