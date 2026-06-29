# AI_CONTEXT — read me first (3-minute onboarding)

> Single source of architectural memory for any AI session (Claude, GPT, or future model).
> If anything here conflicts with the code, the code + [`architecture/`](architecture/README.md)
> contract win — update this file. Companion files: [PROJECT_STATE.md](PROJECT_STATE.md) ·
> [DECISIONS.md](DECISIONS.md) · [MASTER_PROMPT.md](MASTER_PROMPT.md) ·
> [DEVELOPMENT_PROCESS.md](DEVELOPMENT_PROCESS.md).

## Project vision

**Lumo** — an enterprise, AI-native commerce platform for **premium educational toys (ages 0–10)**.
It must outperform Shopify on **CRO experimentation, marketing attribution, first-party analytics,
and customization**. Built incrementally at senior-architecture quality; **quality over speed**.

## Architecture summary

- **Modular monolith first**, extract to services only on measured need (Strangler Fig; [ADR-0001](architecture/adr/0001-modular-monolith-with-strangler-extraction.md)).
- **DDD** bounded contexts; **one PostgreSQL schema per context**; **no cross-context FKs/joins**.
- **Clean Architecture** — dependencies point **inward**:
  `kernel → domain → application → infrastructure → presentation`.
- **Event-driven** via transactional outbox + CDC (Redpanda) — _not built yet_.
- **First-party data**, **privacy/child-safety by design** (COPPA/GDPR-K), **API-first**,
  **everything-as-config** (flags/experiments/feeds), **observability + security by default**.
- Full contract: [`docs/architecture/`](architecture/README.md) (01–21 + ADRs). Build sequence:
  [`implementation/IMPLEMENTATION_ROADMAP.md`](implementation/IMPLEMENTATION_ROADMAP.md).

## Current package structure (Turborepo + pnpm; scope `@platform/*`)

| Layer                                                     | Packages                                                                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Kernel** (framework-free; any layer may use)            | `types` (Result/Either + Brand), `utils` (logger, AppError + DomainError hierarchy + error envelope)                                                                                 |
| **Domain** (pure; kernel only)                            | `domain` (Entity, AggregateRoot, ValueObject, UniqueEntityId, DomainEvent, Guard, Specification, DomainService)                                                                      |
| **Contracts** (outbound port interfaces; no runtime deps) | `contracts` (`IdGenerator`, `Clock`), `repository` (persistence ports), `domain-events` (integration-event envelope + topic/versioning + `EventSerializer`)                          |
| **Application** (no infra deps)                           | `application` (DI, CQRS buses, UseCase, middleware; owns the `ID_GENERATOR`/`CLOCK` DI tokens), `config` (typed env + server config + flags), `tracking` (event-envelope types)      |
| **Messaging** (event backbone; above application)         | `messaging` (transactional outbox write-side, `EventPublisher`/`EventConsumer`, idempotency, retry, DLQ; in-memory adapters — broker/Debezium/Avro deferred)                         |
| **Infrastructure** (adapters)                             | `db` (Prisma + repo adapter), `redis`, `clickhouse`, `storage` (S3/MinIO), `secrets`, `observability` (OTel), `health`, `id` (`CryptoIdGenerator` → UUIDv7), `clock` (`SystemClock`) |
| **UI + build config**                                     | `ui` (shadcn), `design` (frozen tokens), `eslint-config`, `tsconfig`, `prettier-config`                                                                                              |
| **Apps**                                                  | `apps/storefront` (Next.js shell), `apps/admin/prototype` (**frozen** UI HTML)                                                                                                       |

Per-package responsibilities: [`development/WORKSPACE_GUIDE.md`](development/WORKSPACE_GUIDE.md).

## Dependency rules (enforced by convention; CI fitness functions planned)

- Packages never import from `apps/`. Apps/services import packages, never each other's internals.
- **Domain** depends only on the kernel. **Application** never imports infrastructure (uses ports + DI).
  **Outbound ports** are interfaces in leaf packages (`contracts`, `repository`); **Infrastructure**
  adapters implement them depending only on those packages (e.g. `db`→`repository`, `id`/`clock`→`contracts`),
  never on `application`. DI tokens live in `application`. Dependencies point inward ([ADR-0002](architecture/adr/0002-outbound-ports-in-contracts-package.md)).
- Cross-package imports use the public entry only (`@platform/<pkg>`), never deep `src` paths.

## Sprint status

- ✅ **0.1** monorepo · ✅ **0.2** infrastructure · ✅ **0.3** application layer · ✅ **0.4** domain foundation + ID/Clock abstractions (all validated: lint/typecheck/test/build green).
- **0.4 review findings resolved (2026-06-29):** M1 `@platform/contracts` (port interfaces, [ADR-0002](architecture/adr/0002-outbound-ports-in-contracts-package.md)) · M2 UUIDv7 · M3 `Clock` + `@platform/clock` · M4 deep-frozen value objects · M5 `UniqueEntityId` non-empty invariant · L1 `pullDomainEvents()`. See DECISIONS D-018–D-022.
- **0.5 (design only, 2026-06-29):** Phase 1 (Commerce Core) business-layer design — YAGNI-scoped to 9 contexts (catalog, media, pricing, inventory, cart, checkout, orders, payments, identity); conforms to the contract, no ADR. Spec: [SPRINT_0_5_PHASE1_DESIGN.md](implementation/SPRINT_0_5_PHASE1_DESIGN.md).
- ✅ **0.6 event backbone (2026-06-30):** `@platform/domain-events` (integration-event contracts) + `@platform/messaging` (outbox write-side, publisher/consumer, idempotency, retry, DLQ; in-memory adapters). Classic outbox, no CQRS/ES; `domain ← application ← messaging ← infrastructure`. Broker/Debezium/Avro adapters deferred. See DECISIONS D-023/D-024, [SPRINT_0_6_REPORT.md](implementation/SPRINT_0_6_REPORT.md).
- **Next:** Sprint 0.7 — auth foundation (Ory) + audit/flags/tenancy seams, then 0.8 fitness functions + walking skeleton → Phase 1 (1.1–1.6). See [PROJECT_STATE.md](PROJECT_STATE.md).

## Important conventions & coding standards

- **Strict TypeScript** (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`); `type` imports; **no `any`/`@ts-ignore`/`eslint-disable`**.
- Prettier: 2-space, **double quotes**, width 100, semicolons, trailing commas. ESLint 9 flat config.
- Errors via `@platform/utils` (`AppError`/`DomainError`); `Result` for expected failures, exceptions for unexpected. Logging via `@platform/utils` logger (no raw `console.log`).
- Conventional Commits (commitlint). Full standards: [`development/CODING_STANDARDS.md`](development/CODING_STANDARDS.md).
- **Env gotchas:** pnpm **11.9.0** (Corepack); installs need `CI=true`, `--no-frozen-lockfile` when deps change; pnpm-11 `minimumReleaseAge` supply-chain policy; approved build scripts allowlisted in `pnpm-workspace.yaml` (`allowBuilds`).

## Things AI must **NEVER** change (without explicit approval / an ADR)

1. The **frozen admin UI** — [`docs/ui/`](ui/README.md) is the visual source of truth; extend functionality only, never redesign; new admin surfaces need approval.
2. **Completed sprints (0.1–0.4)** — treat as production; no unrelated refactoring.
3. The **architecture contract** ([`architecture/`](architecture/README.md)) — change only via an [ADR](architecture/adr/).
4. **Dependency direction & layer boundaries** (domain pure; application ↛ infrastructure).
5. **Homes of shared concepts** — `Result`→`types`, errors→`utils`, persistence ports→`repository`, other outbound ports→`contracts` (DI tokens→`application`), CQRS→`application`. Never create parallel implementations.
6. **Identifiers:** package scope stays `@platform/*`; project root folder is `lumo-platform`.
7. **Toolchain pins:** `packageManager` (pnpm 11.9.0), the lockfile, and `allowBuilds`.

## Things AI **is allowed** to extend

- Add new packages that respect the layering; add bounded-context domain/app packages per the architecture.
- Extend the kernel **additively** (new helpers/errors) without breaking existing exports.
- Add infrastructure **adapters** that implement existing ports.
- Add tests and documentation.
- Implement the next approved sprint exactly as specified — nothing more.
