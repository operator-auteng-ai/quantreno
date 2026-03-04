# CODING-STANDARDS.md

These standards are mandatory for all code in this repository.

## 1) Core engineering principles

- Production quality by default: reliability, debuggability, and safe failure modes are required.
- Secure by default: every feature must have explicit security considerations.
- DRY over copy/paste: share logic through modules, packages, and generators.
- Simplicity over cleverness: prefer explicit, maintainable implementations.
- Schema-first where possible: define contracts first, generate types/artifacts from them.

## 2) Language and framework defaults

- TypeScript first for application and shared logic.
- Enable strict TypeScript settings (`strict: true`) and keep `any` out of production paths.
- Prefer functional, side-effect-aware modules with clear boundaries.
- Keep framework-specific code at edges; keep domain logic framework-agnostic.

## 3) Schema-first and code generation policy

Schema definitions are the source of truth whenever possible.

- API contracts:
  - Define HTTP APIs via OpenAPI.
  - Generate request/response types and clients from OpenAPI.
  - Avoid hand-written duplicate API types.
- JSON data contracts:
  - Define config/event/payload shapes with JSON Schema.
  - Generate TypeScript types from schemas when possible.
  - Validate runtime inputs against schema-derived validators.
- Database contracts:
  - Treat database schema and migrations as canonical.
  - Generate DB types from schema/migrations (ORM or query tool output).
  - Keep hand-written DB model types to a minimum.
- Single-source contract rule:
  - If a type can be generated from a canonical schema, generate it.
  - Do not maintain parallel manual versions of the same contract.

## 4) Security requirements

- Validate all untrusted input at trust boundaries.
- Encode/escape output for its target context.
- Enforce authentication and authorization explicitly at protected boundaries.
- Use least-privilege credentials and scoped API tokens.
- Never commit secrets; load from secure environment sources.
- Store local secrets/tokens in OS-backed secure storage where available (for macOS apps, Keychain).
- Maintain dependency hygiene:
  - Pin versions appropriately.
  - Scan for vulnerabilities in CI.
  - Patch critical issues quickly.
- Log security-relevant events with enough context for auditing, without leaking secrets/PII.

## 5) Data and privacy

- Collect minimum required data only.
- Classify sensitive data and apply stricter handling.
- Use encryption in transit for all network communication.
- Define retention/deletion behavior for user and event data.
- Do not log secrets, auth tokens, or raw sensitive payloads.

## 6) Testing and verification

- Required test layers, run in this order locally before considering work complete:
  1. **Unit tests** for domain logic (run first).
  2. **Integration / API tests** for adapters and persistence (run second).
  3. **System-level browser / E2E tests** for critical user journeys (run last).
- Do not skip levels. Fix failures at each level before proceeding to the next.
- Contract tests are required for generated API/database interfaces.
- Bug fixes must include a regression test when practical.
- CI must run type-check, lint, tests, and build before merge.

## 7) Observability and operability

- Structured logs with correlation IDs for request/workflow tracing.
- Metrics for core product and system health indicators.
- Error tracking with actionable context.
- Idempotent, retry-safe background jobs where applicable.
- Feature flags for high-risk rollouts when practical.

## 8) Architecture and code organization

- Separate layers:
  - Domain logic
  - Application orchestration
  - Infrastructure/adapters (DB, HTTP, filesystem, third-party APIs)
  - UI/presentation
- Keep cross-layer dependencies one-directional.
- Prefer small, cohesive modules with explicit interfaces.
- Shared types/utilities belong in a dedicated shared package/module, not duplicated.

## 9) Code review and merge standards

- **All work happens on a branch — never commit directly to `main`.**
- No direct merges without passing CI.
- **Never merge to `main` unless explicitly requested.** When merging, always use **squash merge**.
- Reviews focus on correctness, security, behavior changes, and maintainability.
- Reject changes that introduce unnecessary duplication when reusable abstractions exist.
- Generated files are acceptable only when source schema/tooling is included and reproducible.

## 10) Documentation standards

- Every significant module has concise usage and ownership context.
- Public interfaces include clear contract documentation.
- Architectural decisions with tradeoffs should be captured as ADRs (or equivalent).
- Keep setup/build/run instructions current.

## 11) Definition of done

A change is done only when all are true:

- Requirements are implemented.
- Contracts/schemas are updated.
- Generated artifacts are up to date.
- Tests pass (including new regression coverage when relevant).
- Security/privacy impact is addressed.
- Observability and documentation are updated.
