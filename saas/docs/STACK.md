# Stack Reference

> Pinned versions and configuration for the Kalshi Trading Agent SaaS.
> Source of truth: `chatbot/package.json` (v3.1.0).

---

## Runtime

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20.x | Vercel runtime |
| pnpm | 9.12.3 | `packageManager` field in package.json |
| TypeScript | ~5.6.3 | `strict: true`, `strictNullChecks: true` |

---

## Framework

| Package | Version | Role |
|---------|---------|------|
| `next` | 16.0.10 | App Router, RSC, API routes, middleware |
| `react` | 19.0.1 | UI rendering |
| `react-dom` | 19.0.1 | DOM bindings |

### Next.js Config

- `cacheComponents: true` — React Server Component caching
- Remote images: `avatar.vercel.sh`, `*.public.blob.vercel-storage.com`
- Build: `tsx lib/db/migrate && next build` (migrations run before build)
- Dev: `next dev --turbo` (Turbopack)

### TypeScript Config

- Target: ESNext
- Module: ESNext with bundler resolution
- `strict: true`, `strictNullChecks: true`
- Path alias: `@/*` → `./*`

---

## AI

| Package | Version | Role |
|---------|---------|------|
| `ai` | 6.0.37 | Vercel AI SDK — streaming, tool calling, data streams |
| `@ai-sdk/gateway` | ^3.0.15 | Unified proxy to Claude, GPT, Gemini, Grok |
| `@ai-sdk/react` | 3.0.39 | React hooks (`useChat`, `useCompletion`) |
| `@ai-sdk/provider` | ^3.0.3 | Provider interface types |

---

## Database

| Package | Version | Role |
|---------|---------|------|
| `postgres` | ^3.4.4 | PostgreSQL driver (postgres.js) |
| `drizzle-orm` | ^0.34.0 | Type-safe ORM, query builder |
| `drizzle-kit` | ^0.25.0 | (dev) Schema generation, migrations, studio |

### Drizzle Config

- Schema: `./lib/db/schema.ts`
- Migrations: `./lib/db/migrations/`
- Dialect: `postgresql`
- Env file: `.env.local`

---

## Auth

| Package | Version | Role |
|---------|---------|------|
| `next-auth` | 5.0.0-beta.25 | NextAuth v5 (Auth.js) — JWT sessions, OAuth |
| `bcrypt-ts` | ^5.0.2 | Password hashing (pure JS, no native deps) |

---

## UI Components

| Package | Version | Role |
|---------|---------|------|
| `tailwindcss` | ^4.1.13 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4.1.13 | (dev) PostCSS integration |
| `@tailwindcss/typography` | ^0.5.15 | (dev) Prose styling |
| `tailwind-merge` | ^2.5.2 | Merge conflicting Tailwind classes |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities |
| `clsx` | ^2.1.1 | Conditional classnames |
| `classnames` | ^2.5.1 | Conditional classnames (legacy) |
| `class-variance-authority` | ^0.7.1 | Component variant styling (CVA) |
| `radix-ui` | ^1.4.3 | Radix UI primitives (umbrella) |
| `cmdk` | ^1.1.1 | Command palette |
| `sonner` | ^1.5.0 | Toast notifications |
| `lucide-react` | ^0.446.0 | Icon library |
| `@icons-pack/react-simple-icons` | ^13.7.0 | Brand icons |
| `next-themes` | ^0.3.0 | Dark/light theme toggle |
| `react-resizable-panels` | ^2.1.7 | Resizable panel layout |

### shadcn/ui Config (`components.json`)

- Style: `default`
- RSC: `true`
- Base color: `zinc`
- CSS variables: `true`
- Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`

### Radix Primitives (individual)

| Package | Version |
|---------|---------|
| `@radix-ui/react-collapsible` | ^1.1.12 |
| `@radix-ui/react-dialog` | ^1.1.15 |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 |
| `@radix-ui/react-hover-card` | ^1.1.15 |
| `@radix-ui/react-icons` | ^1.3.0 |
| `@radix-ui/react-progress` | ^1.1.8 |
| `@radix-ui/react-scroll-area` | ^1.2.10 |
| `@radix-ui/react-select` | ^2.2.6 |
| `@radix-ui/react-separator` | ^1.1.8 |
| `@radix-ui/react-slot` | ^1.2.4 |
| `@radix-ui/react-tooltip` | ^1.2.8 |
| `@radix-ui/react-use-controllable-state` | ^1.2.2 |
| `@radix-ui/react-visually-hidden` | ^1.1.0 |

---

## Editors & Rich Content

| Package | Version | Role |
|---------|---------|------|
| `codemirror` | ^6.0.1 | Code editor (artifacts) |
| `@codemirror/lang-javascript` | ^6.2.2 | JS syntax for CodeMirror |
| `@codemirror/lang-python` | ^6.1.6 | Python syntax for CodeMirror |
| `@codemirror/state` | ^6.5.0 | CodeMirror state management |
| `@codemirror/theme-one-dark` | ^6.1.2 | Dark theme for CodeMirror |
| `@codemirror/view` | ^6.35.3 | CodeMirror view layer |
| `prosemirror-*` | various | Rich text editor (text artifacts) |
| `shiki` | ^3.21.0 | Syntax highlighting |
| `react-syntax-highlighter` | ^15.6.6 | Code block rendering |
| `katex` | ^0.16.25 | Math/LaTeX rendering |
| `react-data-grid` | 7.0.0-beta.47 | Spreadsheet artifact |
| `@xyflow/react` | ^12.10.0 | Flow diagrams (React Flow) |

---

## Data & Streaming

| Package | Version | Role |
|---------|---------|------|
| `redis` | ^5.0.0 | Upstash Redis client |
| `resumable-stream` | ^2.2.10 | SSE stream recovery via Redis |
| `swr` | ^2.2.5 | Client-side data fetching + caching |
| `streamdown` | ^2.0.1 | Streaming markdown renderer |
| `zod` | ^3.25.76 | Runtime schema validation |
| `papaparse` | ^5.5.2 | CSV parsing |

---

## Animation

| Package | Version | Role |
|---------|---------|------|
| `framer-motion` | ^11.3.19 | Component animations |
| `motion` | ^12.23.26 | Motion library (newer API) |
| `embla-carousel-react` | ^8.6.0 | Carousel component |

---

## Vercel Platform

| Package | Version | Role |
|---------|---------|------|
| `@vercel/analytics` | ^1.3.1 | Page view analytics |
| `@vercel/blob` | ^0.24.1 | File storage (uploads) |
| `@vercel/functions` | ^2.0.0 | Serverless function config (maxDuration) |
| `@vercel/otel` | ^1.12.0 | OpenTelemetry instrumentation |

---

## Observability

| Package | Version | Role |
|---------|---------|------|
| `@opentelemetry/api` | ^1.9.0 | OpenTelemetry tracing API |
| `@opentelemetry/api-logs` | ^0.200.0 | OpenTelemetry logging API |
| `@vercel/otel` | ^1.12.0 | Vercel OTel integration |

---

## Utilities

| Package | Version | Role |
|---------|---------|------|
| `nanoid` | ^5.1.3 | ID generation |
| `date-fns` | ^4.1.0 | Date formatting/manipulation |
| `diff-match-patch` | ^1.0.5 | Text diffing (artifact versioning) |
| `fast-deep-equal` | ^3.1.3 | Deep equality comparison |
| `orderedmap` | ^2.1.1 | Ordered map (ProseMirror dep) |
| `geist` | ^1.3.1 | Geist font family |
| `usehooks-ts` | ^3.1.0 | React hook utilities |
| `use-stick-to-bottom` | ^1.1.1 | Auto-scroll to bottom |
| `server-only` | ^0.0.1 | Prevent server code in client bundles |
| `dotenv` | ^16.4.5 | Load env files |

---

## Dev & Tooling

| Package | Version | Role |
|---------|---------|------|
| `typescript` | ^5.6.3 | Type checking |
| `tsx` | ^4.19.1 | TypeScript execution (scripts, migrations) |
| `@biomejs/biome` | 2.3.11 | Linter + formatter (replaces ESLint + Prettier) |
| `ultracite` | ^7.0.11 | Biome preset (core + next + react rules) |
| `postcss` | ^8 | CSS processing |
| `@playwright/test` | ^1.50.1 | E2E testing |

### Biome Config

- Extends: `ultracite/biome/core`, `ultracite/biome/next`, `ultracite/biome/react`
- Indent: 2 spaces
- Excludes from lint: `components/ui`, `lib/utils.ts`, `hooks/use-mobile.ts`
- Notable overrides: `noExplicitAny: off`, `noConsole: off`

---

## To Add (per ARCH.md / PLAN.md)

These packages will be added during implementation:

| Package | Phase | Role |
|---------|-------|------|
| `@upstash/qstash` | Phase 4 | QStash job publishing + signature verification |
| `stripe` | Phase 3 | Stripe Node.js SDK — subscriptions, webhooks |
| `@stripe/stripe-js` | Phase 3 | Stripe client-side (Checkout, Elements) |
| `resend` | Phase 4 | Transactional email SDK |
| Additional OAuth providers for NextAuth | Phase 0 | Google, GitHub adapters |
