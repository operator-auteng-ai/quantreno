# SDS.md

Design System Specification for Quantreno.

Status: Draft v0.1

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
- Brand: `--brand-primary`, `--brand-gradient-start`, `--brand-gradient-end`
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

## 8) Component Layers

### 8.1 Primitives (shadcn, immutable)

Located in `components/ui/`. Currently available (from `components.json` registry):

- Layout: `sidebar`, `separator`, `scroll-area`, `card`
- Form: `button`, `input`, `select`, `label`, `form`, `textarea`
- Overlay: `dialog`, `alert-dialog`, `dropdown-menu`, `tooltip`, `hover-card`
- Display: `badge`, `progress`, `skeleton`, `collapsible`
- Feedback: `sonner` (toasts)

### 8.2 AI Elements (chat-specific)

Located in `components/ai-elements/`. Chat rendering primitives:

- `message`, `conversation`, `loader`, `shimmer`
- `tool`, `reasoning`, `chain-of-thought`
- `confirmation`, `artifact`, `canvas`
- `prompt-input`, `model-selector`
- `sources`, `inline-citation`
- `suggestion`, `plan`, `task`

### 8.3 Trading Components (to build)

Wrappers with product semantics for trading workflows:

- `PositionCard` — ticker, side, entry price, current price, P&L, confidence
- `OrderConfirmation` — pre-trade review with risk metrics
- `MarketCard` — event title, price, volume, expiry countdown
- `StrategyBadge` — strategy name with color coding
- `PnLDisplay` — profit/loss with signal coloring (green/red)
- `PricePill` — formatted price in monospace with direction indicator
- `EdgeMeter` — visual edge percentage with confidence band

Wrapper rules:

- Accept typed props only
- Map all visual states to tokens
- Use `--signal-*` tokens for profit/loss/neutral states
- Encapsulate primitive composition and class variance in wrapper

### 8.4 Landing Components (to build)

Located in `components/landing/`:

- `Hero` — headline, subhead, CTA buttons, background effect
- `HowItWorks` — 3-step visual flow
- `Features` — feature grid with icons
- `Pricing` — tier comparison table
- `Footer` — links, legal disclaimers, regulatory notice

### 8.5 Patterns (workflow composites)

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

## 15) Change Management

When adding or changing UI patterns:

1. Update this SDS if new conventions are needed
2. Add or update tokens if new semantics are required
3. Implement through wrapper or pattern layer
4. Verify in both dark and light mode

Do not fork primitive behavior in feature code.

## 16) Definition of Done for UI Work

A UI task is done only when:

- It uses tokenized styling (no hardcoded visual constants)
- It uses wrapper/pattern layers instead of raw primitive composition in feature code
- Loading/empty/error/success states are implemented
- Accessibility requirements in section 12 are met
- Responsive layout verified (mobile + desktop)
- Dark and light mode verified
- Relevant SDS sections are updated if behavior conventions changed
