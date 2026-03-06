# CLAUDE.md — Project-Wide Rules

We were working on converting the kalshi_sop.md into a fully functional saas based on vercel in ./saas.

## Branching

- **Always work on a branch.** Never commit directly to `main`.
- Create a descriptive branch before starting work (e.g., `feat/add-auth`, `fix/market-polling`).
- Work directly in the main repo — do not use git worktrees unless parallel work is explicitly needed.

## Testing

Run tests locally in this order before considering work complete:

1. **Unit tests** — fast, isolated domain logic tests.
2. **Integration / API tests** — adapters, persistence, API endpoints.
3. **System-level browser / E2E tests** — critical user journeys.

Fix failures at each level before moving to the next.

## Merging

- **Never merge to `main` unless explicitly asked.**
- When asked to merge, **always squash merge** (`git merge --squash <branch>`).

## SaaS-Specific Workflow

See `saas/WORKFLOW.md` for the full session workflow, doc read order, and coding process for the SaaS project.
