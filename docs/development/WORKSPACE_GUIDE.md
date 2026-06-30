# Workspace guide

A Turborepo + pnpm monorepo. Workspaces are globbed in `pnpm-workspace.yaml`: `apps/*`,
`packages/*`, `services/*`.

## Apps

| App          | Stack                               | Notes                                    |
| ------------ | ----------------------------------- | ---------------------------------------- |
| `storefront` | Next.js 15 + React 19 + Tailwind v4 | Foundation shell (no business pages yet) |

> The admin app (React + Vite, per `docs/architecture/01`) and its **frozen** UI
> (`docs/ui/`) are introduced in a later sprint — not in Sprint 0.1.

## Services

Backend bounded-context services live under `services/<context>/` as a Clean-Architecture slice
(`domain/ application/ infrastructure/ interfaces/`). `services/example` is the **non-business
walking-skeleton reference** (proving domain → application → repository → outbox → messaging end to
end). **Phase 1 contexts:** `services/catalog` (products/variants/categories) and `services/media`
(asset metadata) — currently with in-memory persistence + outbox (Prisma, real object storage, and
transport adapters are deferred). Contexts never import each other's source; they reference each
other by bare id (e.g. Catalog's `MediaRef`) and, later, via events/generated clients. Scaffold new
services with `pnpm gen service`.

## Shared packages

Grouped by Clean Architecture layer (lower layers never depend on higher ones).

### Kernel (framework-free; usable by any layer)

| Package           | Responsibility                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| `@platform/types` | Generic utility types + `Result`/`Either` helpers.                         |
| `@platform/utils` | Structured logger, `AppError`, domain error hierarchy, API error envelope. |

### Domain (pure; depends only on the kernel)

| Package            | Responsibility                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@platform/domain` | Shared-kernel DDD building blocks: Entity, AggregateRoot, ValueObject, UniqueEntityId, DomainEvent, Guard, Specification, DomainService. No id/clock generation. |

### Contracts (outbound port interfaces; no runtime dependencies)

| Package                | Responsibility                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@platform/contracts`  | Cross-cutting outbound port interfaces: `IdGenerator`, `Clock`. Interfaces only — no implementations, DI, or deps. |
| `@platform/repository` | Persistence ports (repository + unit-of-work interfaces). Implementations live in infrastructure.                  |

> DI tokens for these ports (`ID_GENERATOR`, `CLOCK`) live in `@platform/application`. Infrastructure
> adapters depend only on the contract package, never on `@platform/application`
> ([ADR-0002](../architecture/adr/0002-outbound-ports-in-contracts-package.md)).

### Application layer (no infrastructure dependencies)

| Package                 | Responsibility                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `@platform/application` | DI container, CQRS command/query buses, use-case + handler contracts, middleware pipeline; owns the `ID_GENERATOR`/`CLOCK` DI tokens. |
| `@platform/config`      | Typed env + server config (environment inheritance) + feature-flag infrastructure.                                                    |
| `@platform/tracking`    | Shared tracking event-envelope **types** — no events/logic.                                                                           |

### Infrastructure (adapters; depend on ports/kernel)

| Package                   | Responsibility                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `@platform/db`            | PostgreSQL + Prisma: client, transactions, health, seed, backup config, Prisma repository adapter foundation.          |
| `@platform/redis`         | ioredis connection, cache abstraction, serialization, health.                                                          |
| `@platform/clickhouse`    | ClickHouse client, connection, health.                                                                                 |
| `@platform/storage`       | S3/MinIO signed-URL storage abstraction, bucket config, health.                                                        |
| `@platform/secrets`       | Secret loader (env + Docker file; Vault-ready).                                                                        |
| `@platform/observability` | OpenTelemetry tracing/metrics + logging + error reporting.                                                             |
| `@platform/health`        | Health-check contract + aggregator.                                                                                    |
| `@platform/id`            | `CryptoIdGenerator` — implements the `IdGenerator` port (`@platform/contracts`) with UUIDv7 (RFC 9562, `node:crypto`). |
| `@platform/clock`         | `SystemClock` — implements the `Clock` port (`@platform/contracts`).                                                   |

### UI + build config

| Package                                                                        | Responsibility                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `@platform/ui`                                                                 | shadcn/ui base primitives, theme provider, `cn`. No business components.              |
| `@platform/design`                                                             | Design tokens — encodes the **frozen** UI design system (`docs/ui/DESIGN_SYSTEM.md`). |
| `@platform/eslint-config` · `@platform/tsconfig` · `@platform/prettier-config` | Shared ESLint / TypeScript / Prettier configs.                                        |

## Dependency rules (enforced in CI via `pnpm arch` — dependency-cruiser)

- Packages never import from `apps/` or `services/`.
- Apps/services import packages; never each other's internals (a service may not import another service's `src`).
- **Domain (`@platform/domain` and `services/*/src/domain`) depends only on the kernel** (`@platform/types`, `@platform/utils`) + `@platform/domain` — no infrastructure, frameworks, messaging, or id/clock generation.
- **Application never imports `@platform/messaging` or infrastructure** — it depends on domain + ports only; **messaging never imports application or infrastructure**. Dependencies point inward (docs/architecture/02; ADR-0002).
- **Import packages via their public entry** — `@platform/<pkg>` (or a declared subpath like `/testing`), **never a deep `@platform/<pkg>/src/*` path**.
- Cross-package types resolve via workspace symlinks (`exports` → `src/index.ts`); apps compile
  package source via Next `transpilePackages`.
- **`pnpm arch`** (`.dependency-cruiser.cjs`) enforces all of the above + **no circular dependencies** (runtime cycles), and is gated in CI.

## Generators (`pnpm gen`)

Scaffold consistently (never hand-roll); generated code passes lint/typecheck/test/arch on creation:

```bash
pnpm gen package     # a shared @platform/* package (README + vitest + sample test)
pnpm gen service     # a bounded-context service under services/ (clean-architecture slice)
pnpm gen aggregate   # a domain aggregate + repository port (+ test) inside a service
pnpm gen use-case    # an application use-case (+ test) inside a service
pnpm install         # link any new workspace package
```

`services/example` is the canonical reference output. Templates live in `turbo/generators/`.

## Versioning

Shared packages use [changesets](https://github.com/changesets/changesets) (`pnpm changeset`).
Apps (e.g. `storefront`) are private and excluded.

## Turborepo tasks

Defined in `turbo.json`: `build`, `lint`, `typecheck`, `test`, `dev`, `clean`. Builds are cached
and parallelized; `dev` is persistent and uncached. Architecture fitness runs via the root
`pnpm arch` script (dependency-cruiser), gated in CI alongside lint/typecheck/build/test.
