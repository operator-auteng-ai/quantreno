# Progress Log

> Append-only session log. Never rewrite or delete prior entries.

---

## 2026-02-28 — Planning & Setup

**Phase:** Pre-Phase 0 (Planning)

### Changes
- Created all planning docs: VISION.md, ARCH.md, INFRASTRUCTURE.md, PLAN.md, TAXONOMY.md, STACK.md, CODING-STANDARDS.md, WORKFLOW.md
- Forked Vercel chatbot v3.1 inline at `chatbot/`
- Renamed project from "Kalshi Trading Agent" to "SaaS" — multi-exchange vision (Tradier, Coinbase in V2+)
- Renamed directory from `kalshi-saas/` to `saas/`

### Decisions
- Keep NextAuth (not Supabase Auth) — already functional, add OAuth
- Vercel hosting (not AWS) — ~$75/mo vs $200+, migrate when needed
- QStash fan-out for per-user cron scans — serverless-friendly
- Chatbot inline (not submodule) — heavy divergence expected, no upstream sync benefit
- Product name "saas" (working title) — V2+ adds Tradier, Coinbase, cross-ecosystem mispricings

### Next
- Phase 0.1: Create Vercel project, deploy, verify build
