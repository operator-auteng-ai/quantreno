# Quantreno

AI trading assistant for Kalshi prediction markets. Research catalysts, analyze mispricings, and execute trades — all through a single conversation.

Built on [Vercel Chatbot v3.1](https://github.com/vercel/chatbot) with Next.js 16, AI SDK v6, Drizzle ORM, and NextAuth v5.

## Getting Started

### Prerequisites

- Node.js 20.x
- pnpm 9.12.3 (`corepack enable && corepack prepare pnpm@9.12.3`)
- PostgreSQL (or Supabase)
- Redis (or Upstash)

### Environment

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### Install & Run

```bash
pnpm install
pnpm db:migrate   # run database migrations
pnpm dev           # start dev server on http://localhost:3000
```

### Build

```bash
pnpm build   # runs migrations then builds
pnpm start   # start production server
```

## Testing

The project uses a three-layer test ladder as required by [CODING-STANDARDS.md](../docs/CODING-STANDARDS.md). Run tests in this order — fix failures at each level before proceeding to the next.

### 1. Unit + Integration Tests (Vitest)

Fast, isolated tests for domain logic and API route handlers. No dev server or database required — all external dependencies are mocked.

```bash
pnpm test:unit          # run once
pnpm test:unit:watch    # interactive watch mode
```

**What's tested:**

| Area | File | Coverage |
|------|------|----------|
| AI models | `lib/ai/__tests__/models.test.ts` | Model registry, provider grouping, defaults |
| Entitlements | `lib/ai/__tests__/entitlements.test.ts` | Rate limits per user type |
| Prompts | `lib/ai/__tests__/prompts.test.ts` | System prompt composition, reasoning model detection |
| Tool wrapper | `lib/ai/__tests__/tool-wrapper.test.ts` | Summarization, hard-capping, audit entries |
| Errors | `lib/__tests__/errors.test.ts` | Error codes, HTTP status mapping, visibility rules |
| Vote API | `app/(chat)/api/vote/__tests__/route.test.ts` | Auth, validation, ownership checks |
| History API | `app/(chat)/api/history/__tests__/route.test.ts` | Pagination, bulk delete |
| Document API | `app/(chat)/api/document/__tests__/route.test.ts` | CRUD, ownership, validation |
| Credentials API | `app/(chat)/api/kalshi/credentials/__tests__/route.test.ts` | Encrypt + save, connection test, Zod validation |
| Suggestions API | `app/(chat)/api/suggestions/__tests__/route.test.ts` | Fetch, ownership |
| File upload API | `app/(chat)/api/files/upload/__tests__/route.test.ts` | Size/type validation, blob upload |

### 2. E2E Tests (Playwright)

Browser-based tests for critical user journeys. Requires a running dev server and database connection.

```bash
pnpm test:e2e   # starts dev server automatically, runs Chromium
```

Playwright config is in `playwright.config.ts`. Tests live in `tests/e2e/`.

### 3. Run the Full Suite

```bash
pnpm test   # runs unit + integration tests (Vitest)
```

> **Note:** E2E tests are run separately via `pnpm test:e2e` because they require a live database and dev server.

### Writing New Tests

- **Unit tests:** Place in `__tests__/` directories co-located with source (e.g., `lib/ai/__tests__/foo.test.ts`)
- **API route tests:** Place in `app/(chat)/api/<route>/__tests__/route.test.ts`
- **E2E tests:** Place in `tests/e2e/<name>.test.ts`
- **Shared helpers:** `__tests__/helpers/auth.ts` (session mocks), `__tests__/helpers/request.ts` (request builders)

Vitest config is in `vitest.config.ts`. The setup file (`vitest.setup.ts`) stubs `server-only` so DB query modules can be imported in tests.

## Linting & Formatting

```bash
pnpm lint     # check with Biome (ultracite preset)
pnpm format   # auto-fix with Biome
```

## Database

```bash
pnpm db:generate   # generate migrations from schema changes
pnpm db:migrate    # apply migrations
pnpm db:studio     # open Drizzle Studio (visual DB browser)
pnpm db:push       # push schema directly (dev only)
```

Schema is defined in `lib/db/schema.ts`. Migrations live in `lib/db/migrations/`.

## Project Structure

```
chatbot/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes + NextAuth config
│   └── (chat)/            # Chat routes + API endpoints
├── artifacts/             # Artifact types (code, image, sheet, text)
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Core libraries
│   ├── ai/               # Models, prompts, tools, providers
│   ├── db/               # Drizzle schema, queries, migrations
│   └── kalshi/           # Kalshi API client + encryption
├── tests/                 # Playwright E2E tests
│   ├── e2e/             # Test files
│   ├── pages/           # Page objects
│   └── helpers.ts       # Test data generators
├── __tests__/helpers/     # Shared Vitest test utilities
├── vitest.config.ts       # Vitest configuration
├── playwright.config.ts   # Playwright configuration
└── package.json
```

## Documentation

Architecture and planning docs live in `../docs/`:

- **CODING-STANDARDS.md** — Engineering quality bars, security rules
- **STACK.md** — Pinned versions, package inventory
- **ARCH.md** — Architecture decisions, Mermaid diagrams, DB schema
- **PLAN.md** — Phased implementation plan
- **VISION.md** — Product scope, pricing, target users
