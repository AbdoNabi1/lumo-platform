# DEVELOPMENT_PROCESS — how every feature/sprint is built

> The mandatory, repeatable workflow for Lumo. Applies to every sprint and every AI session.
> Companion: [MASTER_PROMPT.md](MASTER_PROMPT.md) (paste into the session) and
> [AI_CONTEXT.md](AI_CONTEXT.md) (project memory).

## Phase 1 — Read

- Read [`AI_CONTEXT.md`](AI_CONTEXT.md), [`PROJECT_STATE.md`](PROJECT_STATE.md), [`DECISIONS.md`](DECISIONS.md).
- Read only the architecture docs, coding standards, and packages **relevant to this sprint**.
- Inspect only the files that will actually be affected.
- **If documentation conflicts or scope is ambiguous → STOP, explain, and wait for clarification. Never guess.**

## Phase 2 — Plan

Produce a **concise** plan containing only:

- affected packages
- files to create
- files to modify
- architecture decisions
- risks

**STOP. Wait for explicit approval. Do not write any code.**

## Phase 3 — Implementation (only after approval)

- Implement **exactly** the approved sprint — nothing more.
- Production-ready: no TODOs, placeholders, mocks, disabled lint rules, or duplicated logic.
- Strict TypeScript; deterministic; immutable where applicable; composition over inheritance.
- Reuse/extend existing abstractions; respect layer boundaries and the freeze list.

## Phase 4 — Validation (all must pass)

Run, and fix every issue until all are green — never ignore a failure:

```
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Phase 5 — Documentation

Update, as applicable:

- [`AI_CONTEXT.md`](AI_CONTEXT.md) — package structure / rules / sprint status, if changed.
- [`PROJECT_STATE.md`](PROJECT_STATE.md) — move the sprint to completed; set the next sprint.
- [`DECISIONS.md`](DECISIONS.md) — append any new decision (Decision · Reason · Trade-offs); add an [ADR](architecture/adr/) if the architecture contract changed.
- `docs/implementation/SPRINT_X_REPORT.md` — implemented features, architecture decisions, files created/modified, validation results, remaining work (keep concise).

## Commit gate

**Only after Phases 4 and 5 are complete and all four commands are green** is the work commit-ready
(Conventional Commits). Then **stop** — do not start the next sprint until instructed.
