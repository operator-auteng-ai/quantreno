# WORKFLOW.md

## Mandatory Repo Standards

- Always read and apply `docs/CODING-STANDARDS.md` before planning, coding, reviewing, or generating code.
- Treat `docs/CODING-STANDARDS.md` as normative. If another instruction conflicts, explicitly call out the conflict and follow the stricter production/security requirement.

## Branching Policy

- **Always work on a branch.** Never commit directly to `main`.
- Create a descriptive feature/fix branch before starting any work (e.g., `feat/add-auth`, `fix/market-polling`).
- **Never merge to `main` unless explicitly asked by the user.**
- When merging to `main`, **always use squash merge** (`git merge --squash <branch>`) to keep history clean.

## Testing Policy

All changes must be verified locally before considering work complete. Run tests in this order:

1. **Unit tests first** — fast, isolated tests for domain logic and utilities.
2. **Integration / API tests second** — tests for adapters, persistence, and API endpoints.
3. **System-level browser tests last** — end-to-end tests for critical user journeys.

Do not skip levels. A failure at any level must be fixed before proceeding to the next.

## Required Session Read Order

1. `docs/CODING-STANDARDS.md`
2. `docs/STACK.md`
3. `docs/TAXONOMY.md`
4. `docs/ARCH.md`
5. `docs/INFRASTRUCTURE.md`
6. `docs/PLAN.md`
7. `docs/VISION.md`
8. `UP_NEXT.md`

## Document Ownership

| Document | Owns |
|----------|------|
| `docs/CODING-STANDARDS.md` | Engineering quality bars, security rules, definition of done |
| `docs/STACK.md` | Technology choices, pinned versions, package inventory |
| `docs/TAXONOMY.md` | Canonical enums, naming conventions, shared vocabulary |
| `docs/ARCH.md` | Architecture decisions, Mermaid diagrams, DB schema, tool definitions |
| `docs/INFRASTRUCTURE.md` | Deployment config, service map, env vars, cron setup, monitoring |
| `docs/PLAN.md` | Phased implementation plan, exit criteria, risk register |
| `docs/VISION.md` | Product scope, pricing, target users, principles, success metrics |

**No duplication between docs.** If information belongs in one doc, reference it from others — don't copy it.

## Workspace Boundary

- Project root: `/Users/paul/projects/claude/saas/`
- Chatbot fork: `/Users/paul/projects/claude/saas/chatbot/`
- Docs: `/Users/paul/projects/claude/saas/docs/`
- Do not assume dependencies or config from the parent `/Users/paul/projects/claude/` trading project are valid for SaaS work.
- All code lives within `chatbot/` (the Next.js app). `docs/` is planning only.

## Session Start Process

1. Complete the required read order above.
2. Read `UP_NEXT.md` — confirms active phase, immediate scope, and blockers.
3. Confirm active phase and immediate task before starting work.
4. If `UP_NEXT.md` doesn't exist yet, create it from the current phase in `docs/PLAN.md`.

## Session End Process

1. Update `UP_NEXT.md` with:
   - What was completed this session
   - What carries over to next session
   - Any blockers or decisions needed
   - The next task to pick up
2. Append a dated summary entry to `PROGRESS_LOG.md` (append-only, never rewrite prior entries).
3. Commit both files.

## Session Closeout Logging

- Maintain `PROGRESS_LOG.md` as append-only at the project root.
- At the end of every session, append a new dated entry with:
  - Phase and task worked on
  - High-level changes made
  - Files created or modified
  - Any decisions or deviations from PLAN.md
- Never rewrite or delete prior log entries.

## Working Process

### Before Writing Code

1. Check `docs/TAXONOMY.md` for correct naming of any entity, enum, tool, or route.
2. Check `docs/ARCH.md` for the relevant architecture pattern (tool flow, DB schema, cron pattern).
3. Check `docs/STACK.md` for correct package versions and config.
4. Check `docs/PLAN.md` for exit criteria of the current phase — know what "done" looks like.

### While Writing Code

- Follow `docs/CODING-STANDARDS.md` — schema-first, strict TypeScript, security defaults.
- Use canonical names from `docs/TAXONOMY.md` — no synonyms, no abbreviations not listed there.
- Stay within the current phase. Don't jump ahead unless blocked.
- If you discover something that changes the architecture, update `docs/ARCH.md` and note it in `PROGRESS_LOG.md`.

### After Writing Code

- Verify against the phase exit criteria in `docs/PLAN.md`.
- Run type check, lint, and build before considering a task complete.
- Run the full test ladder: unit → integration/API → system-level browser (see Testing Policy above).
- Update `UP_NEXT.md` with progress.
- Do **not** merge to `main` unless the user explicitly requests it. When merging, use squash merge.
