# Workspace guide

A Turborepo + pnpm monorepo. Workspaces are globbed in `pnpm-workspace.yaml`: `apps/*`,
`packages/*`, `services/*`.

## Apps

| App          | Stack                               | Notes                                    |
| ------------ | ----------------------------------- | ---------------------------------------- |
| `storefront` | Next.js 15 + React 19 + Tailwind v4 | Foundation shell (no business pages yet) |

> The admin app (React + Vite, per `docs/architecture/01`) and its **frozen** UI
> (`docs/ui/`) are introduced in a later sprint — not in Sprint 0.1.

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

## Dependency rules (enforced by convention now; CI fitness functions later)

- Packages never import from `apps/` or `services/`.
- Apps/services import packages; never each other's internals.
- **Domain (`@platform/domain`) depends only on the kernel** (`@platform/types`, `@platform/utils`) — no infrastructure, frameworks, or id/clock generation.
- **Outbound port interfaces live in leaf packages (`@platform/contracts`, `@platform/repository`); their DI tokens live in `@platform/application`.** Infrastructure adapters depend only on the contract package — `@platform/db`→`@platform/repository`, `@platform/id`/`@platform/clock`→`@platform/contracts` — never on `@platform/application`. Application packages never import infrastructure; dependencies point inward (docs/architecture/02; ADR-0002).
- Cross-package types resolve via workspace symlinks (`exports` → `src/index.ts`); apps compile
  package source via Next `transpilePackages`.

## Adding a package

```bash
pnpm gen        # choose "package", enter a name + description
pnpm install    # link the new workspace package
```

## Versioning

Shared packages use [changesets](https://github.com/changesets/changesets) (`pnpm changeset`).
Apps (e.g. `storefront`) are private and excluded.

## Turborepo tasks

Defined in `turbo.json`: `build`, `lint`, `typecheck`, `test`, `dev`, `clean`. Builds are cached
and parallelized; `dev` is persistent and uncached.
