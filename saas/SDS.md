# SDS.md

Design System Specification for Quantreno.

Status: v0.2 — Component Registry

## 1) Purpose

Define a strict, reusable UI system so the Quantreno SaaS starts with stable conventions instead of ad-hoc UI choices.

This SDS is normative for UI implementation and must be read with:

- `docs/CODING-STANDARDS.md`
- `docs/STACK.md`
- `docs/ARCH.md`
- `docs/VISION.md`
- `docs/PLAN.md`
- `docs/TAXONOMY.md`

If guidance conflicts, apply the stricter security/production requirement.

## 2) Scope

In scope:

- Design system for the Quantreno web application (`chatbot/`)
- Marketing/landing page design conventions
- Token model, component layering, and quality gates

Out of scope:

- Native mobile app design (web-first, responsive only)
- Third-party widget/embed theming
- Experimental visual redesigns not tied to MVP outcomes

## 3) Product UI Direction

Theme direction: Trading Terminal.

- Visual intent: precise, data-dense, high-trust, low decoration
- Core palette family: dark neutral foundation with semantic signal accents
- Default appearance: dark mode primary (trading terminals convention), light mode supported
- Status semantics are functional, not decorative
- Canonical trading vocabulary comes from `docs/TAXONOMY.md`

Design principles:

1. **AI-first** — the chat IS the interface; minimize chrome around it
2. **Data-dense** — market data, positions, P&L should be scannable at a glance
3. **High-trust** — financial product requires visual precision and professional feel
4. **Progressive disclosure** — simple for beginners, dense for power users

## 4) Platform Baseline

- Framework: Next.js 16 (App Router, RSC, Turbopack)
- Renderer: React 19 + TypeScript strict mode
- Styling: Tailwind CSS v4 + CSS variable tokens
- UI primitives: shadcn/ui components (via `components.json` registry)
- shadcn policy: generated primitives in `components/ui/` are immutable
- Customization policy: wrappers + tokens only (never edit generated primitive internals)
- Fonts: Geist (sans) + Geist Mono (mono) — loaded via `next/font/google`
- Icons: Lucide React + React Simple Icons (brand icons)
- Animation: Framer Motion / Motion
- Deployment: Vercel (serverless, edge)

## 5) File Layout

```text
chatbot/
  app/
    layout.tsx              # root layout (fonts, theme provider, session)
    page.tsx                # public landing page (marketing)
    globals.css             # token definitions + base styles
    (auth)/                 # login, register routes
    (chat)/                 # authenticated chat routes
      layout.tsx            # sidebar + data stream provider
      chat/
        page.tsx            # new chat
        [id]/page.tsx       # existing chat
      settings/page.tsx     # user settings
    design-system/          # live design system (dev only)
      layout.tsx            # 3-tab layout: Gallery | Components | Tokens
      page.tsx              # Gallery — overview cards linking to sections
      components/page.tsx   # Components — registry-driven demo renderer
      tokens/page.tsx       # Design Tokens — color scales, typography, motion
      _registry/            # ⭐ SINGLE SOURCE OF TRUTH for all components
        types.ts            # AtomicLevel, RegistryEntry types
        entries.ts          # flat array of all component metadata
        helpers.ts          # getByLevel(), getGrouped(), getCounts()
        demo-map.ts         # React.lazy() import map keyed by entry id
        demos/
          atoms/            # 14 demo files (one per atom)
          molecules/        # 20 demo files (one per molecule)
          components/       # 8 demo files (one per component)
      _components/          # shared DS page components (sidebar, section blocks)
        sections-config.ts  # sidebar/gallery config (counts derived from registry)
  components/
    ui/                     # shadcn primitives (immutable)
    ai-elements/            # AI chat UI elements
    elements/               # chat message elements
    landing/                # marketing page components
    *.tsx                   # app-level composite components
  lib/
    ai/                     # AI SDK config, models, tools, prompts
    db/                     # Drizzle schema, queries, migrations
    kalshi/                 # Kalshi API client, encryption
  public/
    favicon.svg            # canonical favicon asset
    logo.svg               # neutral logo mark asset
    logo-dark-bg.svg       # logo mark for dark backgrounds
    logo-light-bg.svg      # logo mark for light backgrounds
```

Import rules:

- Feature code imports from `@/components`, `@/lib`, `@/hooks`
- Feature code does not import directly from `components/ui/*` where a wrapper exists
- Landing page components live in `components/landing/`
- Design system registry is at `app/design-system/_registry/` — import from there for component metadata

## 6) Token System (Required)

Use semantic tokens only.

- Never hardcode color hex values in component files
- Never encode business status in ad-hoc class strings

### 6.1 Existing Token Groups (from shadcn)

Defined in `globals.css` via CSS custom properties:

- Surface: `--background`, `--card`, `--popover`, `--sidebar`
- Content: `--foreground`, `--card-foreground`, `--popover-foreground`, `--muted-foreground`
- Action: `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`
- Accent: `--accent`, `--accent-foreground`
- Destructive: `--destructive`, `--destructive-foreground`
- Border: `--border`, `--input`, `--ring`
- Chart: `--chart-1..5`
- Layout: `--radius` (0.5rem base)
- Sidebar: full sidebar token set

### 6.2 Extended Tokens (Quantreno-specific)

Add to `globals.css` for trading UI:

- Signal: `--signal-profit` (green), `--signal-loss` (red), `--signal-neutral` (muted), `--signal-info` (blue)
- Confidence: `--confidence-high`, `--confidence-medium`, `--confidence-low`
- Brand: `--brand`, `--brand-foreground`, `--brand-muted`, `--brand-hover`, `--brand-light`, `--brand-gradient-start`, `--brand-gradient-end`
- Data-viz: extend `--chart-*` as needed for trading charts

### 6.3 Theme Configuration

- Provider: `next-themes` (already integrated)
- Modes: `system`, `light`, `dark`
- Default: `system` (respects OS preference)
- Dark mode variant: `@custom-variant dark (&:is(.dark, .dark *));`
- Theme state persists via cookie

Rules:

- New themes must be implemented as variable overrides only (no primitive edits)
- Component code must consume semantic tokens and utility classes only
- All trading signal colors must use `--signal-*` tokens, never raw red/green

## 7) Typography and Density

Typography defaults:

- UI font: Geist Sans (`--font-geist`) — all controls, body text, marketing
- Data font: Geist Mono (`--font-geist-mono`) — prices, tickers, IDs, code
- Base text size: 14px equivalent (Tailwind `text-sm`)
- Marketing hero: up to `text-6xl` on landing page only

### 7.1 Brand Wordmark Exception

Landing nav brand uses a combined logo treatment:

- Graphic mark: use `/logo-light-bg.svg` in light mode and `/logo-dark-bg.svg` in dark mode.
- Text: render `QUANTRENO` adjacent to the mark in a geometric sans-serif stack:
  - `"Avenir Next", "Futura", "Century Gothic", "Montserrat", sans-serif`
- Scope: this geometric stack is only for the landing nav wordmark. Keep Geist Sans as the system UI/body font elsewhere.

Density guidelines:

- Chat interface: comfortable spacing (message bubbles, tool results)
- Trading data: compact tables allowed (position lists, trade history)
- Landing page: generous whitespace, marketing cadence
- Use 4px base grid (Tailwind default spacing scale)

Do not:

- Mix additional font families beyond Geist Sans and Geist Mono, except the landing nav brand wordmark exception above
- Use compact density in marketing/landing contexts
- Display prices without monospace font

## 8) Component Registry (Single Source of Truth)

All UI components are defined in `app/design-system/_registry/entries.ts`. This is the **canonical list** — sidebar counts, gallery cards, and the components page all derive from it. When building new features, check the registry first to find existing components.

### 8.1 Registry Architecture

```text
_registry/
  types.ts      →  AtomicLevel = "atom" | "molecule" | "component"
                    RegistryEntry = { id, label, level, sublabel, source, description }
  entries.ts    →  REGISTRY: RegistryEntry[] (flat array, 42 entries)
  helpers.ts    →  getByLevel(), getGrouped(), getCounts(), getGalleryDescriptions()
  demo-map.ts   →  React.lazy() imports keyed by entry id
  demos/        →  one default-exported component per entry
```

**How the components page works:** `components/page.tsx` is an 85-line orchestrator that loops `LEVELS` → calls `getGrouped(level)` → renders each sublabel group → lazy-loads each demo from `DEMO_MAP[entry.id]` inside `<Suspense>`.

### 8.2 Adding a New Component

1. **Add the entry** to `_registry/entries.ts`:
   ```ts
   { id: "my-widget", label: "My Widget", level: "molecule", sublabel: "Dashboard", source: "@/components/ui/my-widget", description: "Short description" },
   ```
2. **Create the demo** at `_registry/demos/molecules/my-widget-demo.tsx`:
   ```tsx
   export default function MyWidgetDemo() {
     return ( /* self-contained demo JSX */ );
   }
   ```
3. **Add the lazy import** to `_registry/demo-map.ts`:
   ```ts
   "my-widget": lazy(() => import("./demos/molecules/my-widget-demo")),
   ```
4. **Done.** Sidebar count, gallery card, and components page update automatically.

### 8.3 Current Inventory (42 components)

**Atoms (14)** — primitive UI elements:

| Sublabel | Components |
|---|---|
| Buttons | Button (6 variants + brand CTA) |
| Badges | Badge (4 variants + trading signal) |
| Form Controls | Input, Textarea, Label, Select |
| Feedback | Progress, Skeleton |
| Display | Avatar, Tooltip, Separator |
| Scrolling | ScrollArea, Collapsible, Carousel |

**Molecules (20)** — composed from atoms:

| Sublabel | Components |
|---|---|
| Alerts | Alert (5 variants) |
| Cards | Card (standard + position + market) |
| Trading | PricePill, EdgeMeter |
| Navigation | NavSidebarItems, Breadcrumbs, TabBar |
| Dashboard | StatCard, ChatMessage, ActivityFeedItem, WatchlistItem, DataTableRow |
| Overlays | Dialog, AlertDialog, Sheet, DropdownMenu, HoverCard |
| Input Groups | Command, ButtonGroup, InputGroup |

**Components (8)** — full feature blocks:

| Sublabel | Components |
|---|---|
| Trading | P&L Display, OrderConfirmation |
| Dashboard | PortfolioSummary, MarketOverview |
| AI Chat | ChatInput, CommandPalette |
| Settings | KalshiConnection, ThemeToggle |

### 8.4 Sublabel Conventions

Sublabels group components within each atomic level. When adding a new component, use an existing sublabel if it fits. Create a new sublabel only when the component doesn't belong to any existing group. Current sublabels:

- **Atoms:** Buttons, Badges, Form Controls, Feedback, Display, Scrolling
- **Molecules:** Alerts, Cards, Trading, Navigation, Dashboard, Overlays, Input Groups
- **Components:** Trading, Dashboard, AI Chat, Settings

### 8.5 Primitives vs Custom

The `source` field in each registry entry indicates where the component lives:

- `@/components/ui/*` — shadcn primitive (immutable, do not edit)
- `@/components/*` — app-level composite (e.g., `kalshi-connection-form`)
- `custom` — demo-only composition (built from primitives in the demo file itself, not yet extracted to a standalone component)

When a `custom` component is used in production code, extract it to `components/` and update its `source` field.

### 8.6 AI Elements (chat-specific)

Located in `components/ai-elements/`. Chat rendering primitives (not in the registry — these are AI SDK integration components):

- `message`, `conversation`, `loader`, `shimmer`
- `tool`, `reasoning`, `chain-of-thought`
- `confirmation`, `artifact`, `canvas`
- `prompt-input`, `model-selector`
- `sources`, `inline-citation`
- `suggestion`, `plan`, `task`

### 8.7 Landing Components

Located in `components/landing/` (not in the registry — these are marketing-only):

- `Hero` — headline, subhead, CTA buttons, background effect
- `HowItWorks` — 3-step visual flow
- `Features` — feature grid with icons
- `Pricing` — tier comparison table
- `Footer` — links, legal disclaimers, regulatory notice

### 8.8 Wrapper Rules

- Accept typed props only
- Map all visual states to tokens
- Use `--signal-*` tokens for profit/loss/neutral states
- Encapsulate primitive composition and class variance in wrapper
- Demos must be self-contained (no external state, no API calls)

### 8.9 Patterns (workflow composites)

Higher-level compositions for domain workflows:

- Trade execution flow (research → analysis → confirmation → execution)
- Portfolio overview (positions + P&L + alerts)
- Strategy management (list → create/edit → run)
- Onboarding flow (welcome → connect → first trade)

## 9) State and Feedback Standards

Every async UI path must define:

- Loading state (`skeleton` / `spinner` / streaming shimmer)
- Empty state (helpful message with next action)
- Success feedback (`sonner` toast + inline confirmation where needed)
- Error state (user-friendly message + actionable retry path)

Trade-specific states:

- Order pending: pulsing indicator with cancel option
- Order filled: success toast with position summary
- Order rejected: error with explanation and retry
- Position update: subtle price change animation

Every destructive action must use `alert-dialog` (delete chat, cancel order, disconnect account).

## 10) Forms and Validation

- Validation: Zod schemas (already in stack)
- Kalshi credential form: mask private key input, test-before-save pattern
- Strategy config forms: AI-structured from natural language (chat-first, form-second)
- Show field-level error text and preserve user input on recoverable failures
- Disable submit only for invalid or in-flight states, not by default

## 11) Data Visualization Standards

- Primary charts for MVP: sparklines in position cards, P&L trend lines
- Show exact numeric values alongside any visual (auditability)
- Use tokenized color scale only (`--chart-*`, `--signal-*`)
- Price data always in monospace font
- Timestamps in user's local timezone
- Currency formatting: cents with cent sign for contract prices, dollars for P&L

## 12) Accessibility and Interaction

Required:

- Keyboard navigable controls and dialogs
- Visible focus rings on all interactive elements
- WCAG AA contrast minimum for text and status indicators
- Reduced motion support via `prefers-reduced-motion`
- Icon-only controls must have accessible labels
- Trade confirmation must be explicit (no accidental orders)

## 13) Landing Page Design Standards

The marketing landing page follows different density rules than the app:

- Generous whitespace, section padding (`py-24` minimum)
- Hero text can be large (`text-5xl` to `text-6xl`)
- Dark-first design (trading terminal aesthetic)
- Subtle gradient backgrounds, not flat
- CTA buttons use brand accent color
- Pricing table must be clear and scannable
- Regulatory disclaimer visible in footer (not financial advice)
- Mobile-responsive with single-column stacking

## 14) Testing and Quality Gates

Minimum UI quality gates:

- Type-safe props and no `any` in component interfaces
- Loading/empty/error/success states implemented for all async paths
- Accessibility checks for dialogs/forms/tables
- Mobile responsive verification for all new pages
- Dark and light mode verification

## 15) Design System Pages

The live design system is at `/design-system` (dev only) with three tabs:

| Tab | Route | Purpose |
|---|---|---|
| **Gallery** | `/design-system` | Overview cards with counts, links to sections |
| **Components** | `/design-system/components` | All 42 components rendered by atomic level |
| **Design Tokens** | `/design-system/tokens` | Color scales, typography, shadows, motion, z-index |

The Gallery and Components pages derive all counts and descriptions from the registry automatically. Token sections are static.

## 16) Change Management

When adding or changing UI patterns:

1. Add the component to `_registry/entries.ts` + create a demo + add to `demo-map.ts`
2. Update this SDS if new conventions are needed (especially section 8.3 inventory)
3. Add or update tokens in `globals.css` if new semantics are required
4. Implement through wrapper or pattern layer
5. Verify in both dark and light mode
6. Check `/design-system/components` renders the new demo correctly

Do not fork primitive behavior in feature code.

## 17) Definition of Done for UI Work

A UI task is done only when:

- It uses tokenized styling (no hardcoded visual constants)
- It uses wrapper/pattern layers instead of raw primitive composition in feature code
- Loading/empty/error/success states are implemented
- Accessibility requirements in section 12 are met
- Responsive layout verified (mobile + desktop)
- Dark and light mode verified
- Component is registered in `_registry/entries.ts` with a working demo
- Relevant SDS sections are updated if behavior conventions changed
