# DECISIONS — architecture decision log

> Every significant decision, with its reason and trade-offs. **Never redesign a decision without
> explicit approval + a new ADR** (`architecture/adr/`). Newest ADRs win; this log mirrors them in
> brief. Format: Decision · Reason · Trade-offs.

### D-001 — Modular monolith first, extract by Strangler Fig

- **Decision:** Build the transactional core as one deployable with strict module boundaries; run only high-throughput capabilities as separate services; extract others on measured need. ([ADR-0001](architecture/adr/0001-modular-monolith-with-strangler-extraction.md))
- **Reason:** Avoid premature distribution cost; keep velocity; preserve a clean extraction path.
- **Trade-offs:** Requires discipline to keep boundaries; some intentional duplication (e.g. order-time product snapshots).

### D-002 — DDD bounded contexts; one DB schema per context; no cross-context FKs/joins

- **Decision:** Each context owns its data; cross-context references are bare ids; integrity via the owning service + events.
- **Reason:** Makes extraction mechanical; enforces independence.
- **Trade-offs:** No DB-level cross-context integrity; more application-level coordination.

### D-003 — Clean Architecture; dependencies point inward

- **Decision:** `kernel → domain → application → infrastructure → presentation`. Inner layers never import outer.
- **Reason:** Testability, replaceable infrastructure, longevity.
- **Trade-offs:** More interfaces/indirection; ports + adapters overhead.

### D-004 — `Result`/`Either` live in `@platform/types`

- **Decision:** One `Result<T,E>` type + helpers (`ok`/`err`/`map`/`match`/…) in the kernel.
- **Reason:** Usable by every layer without coupling; single source.
- **Trade-offs:** Kernel `types` gains a small runtime surface (acceptable).

### D-005 — Error hierarchy lives in `@platform/utils` (kernel)

- **Decision:** `AppError` + `DomainError` subclasses (`ValidationError`, `NotFoundError`, `ConflictError`, `ConcurrencyError`, `BusinessRuleError`, `UnexpectedError`) + `toErrorEnvelope` in utils.
- **Reason:** The domain layer can use errors without depending on the application layer.
- **Trade-offs:** "Domain"-named errors sit in a kernel package (documented; single error home).

### D-006 — Repository ports in `@platform/repository`; adapters in infrastructure

- **Decision:** Interfaces (`Repository`, `ReadRepository`, `WriteRepository`, `UnitOfWork`, `TransactionalUnitOfWork`) in `repository`; the Prisma adapter foundation in `@platform/db`.
- **Reason:** Dependency Inversion — application depends on ports, never on Prisma.
- **Trade-offs:** Extra port package; adapter wiring via DI.

### D-007 — CQRS lives only in the Application layer

- **Decision:** Command/query buses, handlers, use-cases, middleware in `@platform/application`. Domain has none of it.
- **Reason:** CQRS is an orchestration concern, not a domain concern.
- **Trade-offs:** Buses are type-erased internally (handled with localized, sound casts).

### D-008 — Domain is pure and deterministic

- **Decision:** No id generation, no clock reads, no infrastructure/framework/messaging/HTTP/DB in `@platform/domain`. Depends only on the kernel.
- **Reason:** Reusable by every bounded context; fully unit-testable; no hidden side effects.
- **Trade-offs:** Ids/timestamps must be supplied from outside (more explicit construction).

### D-009 — ID generation through abstraction (Dependency Inversion)

- **Decision:** Domain exposes only `UniqueEntityId` + `UniqueEntityId.from(value)`. The `IdGenerator` **port interface** lives in `@platform/contracts` (D-018); its `ID_GENERATOR` DI token lives in `@platform/application`; the `CryptoIdGenerator` **adapter** lives in infra `@platform/id` (UUIDv7, D-022). The application generates ids and passes them in; repositories rehydrate via `from()`.
- **Reason:** Keeps the domain deterministic and infrastructure-independent.
- **Trade-offs:** Infra adapter + DI wiring; aggregates can't self-mint ids.

### D-010 — Domain events are infrastructure-free

- **Decision:** `DomainEvent` carries supplied `eventId`/`aggregateId`/`occurredAt`; `AggregateRoot` only collects events. No bus, outbox, or publishing in the domain.
- **Reason:** Determinism + keeps messaging an infrastructure concern.
- **Trade-offs:** Event id/time supplied externally; dispatch wired later (outbox).

### D-011 — Frozen UI contract

- **Decision:** `docs/ui/` (+ `apps/admin/prototype/admin-dashboard.frozen.html`) is the visual source of truth. Extend functionality only; never redesign; new surfaces require approval.
- **Reason:** Stable, approved UX; prevents churn.
- **Trade-offs:** New features must fit existing screens or request a UI change.

### D-012 — Strict quality bar

- **Decision:** No `any`/`@ts-ignore`/`eslint-disable`/TODO/placeholder/mock in shipped code; strict TS; type imports; Prettier/ESLint enforced; Conventional Commits.
- **Reason:** Five-year maintainability; merge-ready always.
- **Trade-offs:** Slower to write; occasional localized sound casts at type-erasure boundaries.

### D-013 — DI without decorators

- **Decision:** Token-based DI container (values + singleton/transient factories + scopes); no `reflect-metadata`.
- **Reason:** Composition over inheritance; no metadata/runtime magic.
- **Trade-offs:** Manual registration; no auto-wiring.

### D-014 — Object storage S3-compatible; secrets env/file (Vault-ready); observability OpenTelemetry

- **Decision:** MinIO (dev) behind an S3 abstraction; `SecretProvider` (env + Docker file, Vault-ready); OTel for tracing/metrics + the kernel logger.
- **Reason:** First-party, portable, vendor-neutral.
- **Trade-offs:** Vault/Sentry concretes deferred to later sprints.

### D-015 — No business DB models yet

- **Decision:** Prisma schema is infrastructure-only (no models) until business sprints; first migration lands with the first bounded context.
- **Reason:** Foundations before features; avoid speculative schema.
- **Trade-offs:** Repository adapter is abstract until a concrete model exists.

### D-016 — Toolchain pins

- **Decision:** `packageManager = pnpm@11.9.0`; pnpm-11 lockfile; `minimumReleaseAge` supply-chain policy; `allowBuilds` allowlist; npm scope `@platform/*`; root folder `lumo-platform`.
- **Reason:** Reproducible installs in the available environment; supply-chain safety.
- **Trade-offs:** Fresh resolves need policy-aware handling; scope/folder names are fixed.

### D-017 — Architecture changes are ADR-gated

- **Decision:** Any change to the contract in `docs/architecture/` (or a frozen invariant) requires a numbered ADR before code.
- **Reason:** Prevent silent architecture drift across AI sessions.
- **Trade-offs:** Slight process overhead for changes.

### D-018 — Outbound ports live in dedicated contract packages, never inside a layer

- **Decision:** Outbound port **interfaces** live in leaf packages, not inside `@platform/application`. Persistence ports stay in `@platform/repository` (D-006); other cross-cutting outbound ports (`IdGenerator`, `Clock`) live in `@platform/contracts` (interfaces only, no runtime deps). **DI tokens stay in `@platform/application`** (co-located with the container). Infrastructure adapters depend only on the contract package, never on the application layer. ([ADR-0002](architecture/adr/0002-outbound-ports-in-contracts-package.md); resolves review finding M1.)
- **Reason:** Consistency with D-006; lean adapters (no dependency on the whole application kernel); dependency direction stays inward.
- **Trade-offs:** One extra package; a port's interface and its DI token live in different packages (contract vs. wiring handle).

### D-019 — Time through a `Clock` port (Dependency Inversion)

- **Decision:** Reading the current time is an outbound port: `Clock` interface in `@platform/contracts`, `CLOCK` token in `@platform/application`, `SystemClock` adapter in infra `@platform/clock`. The domain never reads the clock (timestamps are supplied, D-010); application/infra obtain time via the port. _(Resolves review finding M3; abstraction only — no business wiring.)_
- **Reason:** Symmetry with the `IdGenerator` port (D-009); deterministic testing (inject a fixed clock); no hidden `new Date()` side effects.
- **Trade-offs:** One extra package + DI wiring for a small concern.

### D-020 — Value objects are deeply immutable

- **Decision:** `ValueObject` deep-freezes its props at construction (plain objects + arrays, recursively; no cycle handling — props are acyclic data), replacing the previous shallow `Object.freeze`. _(Resolves review finding M4.)_
- **Reason:** Composite value objects (nested objects/arrays) must be truly immutable for sound equality and aliasing safety.
- **Trade-offs:** Small construction cost; nested props must be acyclic plain data.

### D-021 — `UniqueEntityId` rejects empty/whitespace values

- **Decision:** `UniqueEntityId.from(value)` validates with `Guard.againstEmpty` and **throws** the kernel `ValidationError` for empty or whitespace-only input. The public API stays `from(value): UniqueEntityId` (not `Result`). _(Resolves review finding M5.)_
- **Reason:** An empty identity is an invariant violation / corrupt input — fail loud at the construction boundary. Reuses the existing Guard + kernel error (D-005).
- **Trade-offs:** `from()` can throw (an exceptional path, distinct from expected input validation, which uses `Guard` + `Result`).

### D-022 — Application-generated ids are UUIDv7 (RFC 9562)

- **Decision:** `CryptoIdGenerator` produces **UUIDv7** (48-bit ms timestamp + random) using `node:crypto` only — no external dependency. Aligns the implementation with the documented time-ordered id strategy. _(Resolves review finding M2; chosen over an ADR for v4.)_
- **Reason:** Time-ordered ids preserve B-tree/index locality; removes the prior v4 drift. No new dependency keeps the supply-chain policy (D-016) intact.
- **Trade-offs:** UUIDv7 embeds a creation timestamp (minor information exposure) — acceptable for internal ids; hand-rolled generation is covered by format + ordering tests.

### D-023 — Event backbone: classic outbox in two packages

- **Decision:** Cross-context integration-event **contracts** (envelope, topic/versioning helpers, `EventSerializer`) live in `@platform/domain-events` (a leaf — the only async coupling surface). The **runtime** (transactional outbox write-side, `EventPublisher`/`EventConsumer`, `ProcessedEventStore`, `DeadLetterStore`, `RetryPolicy`, in-memory adapters) lives in `@platform/messaging`. Classic DDD + Outbox — **no CQRS/Event Sourcing**. The `OutboxWriter` is invoked by infrastructure (the persistence boundary) and writes only to the outbox inside the aggregate's transaction; `correlationId`/`causationId` live only on integration events (domain events stay pure). Messaging ports stay in `@platform/messaging` (not `@platform/contracts`, which keeps only universal ports). Dependency direction `domain ← application ← messaging ← infrastructure`. (Sprint 0.6; no ADR — the architecture contract docs 02/05 are unchanged.)
- **Reason:** Reuses `@platform/domain` events + `@platform/repository` transactions; lean coupling surface; testable without a broker.
- **Trade-offs:** Two packages; the outbox write is an infrastructure responsibility (the application stays messaging-free).

### D-024 — Serialization is an abstraction; production codec deferred

- **Decision:** `EventSerializer` is an interface; the **production** implementation (Avro/Protobuf via the schema registry) is intentionally **unimplemented** in Sprint 0.6. A **test-only** `InMemoryEventSerializer` lives at `@platform/domain-events/testing`. There is **no JSON production default**. The envelope uses only primitive field types so it is already Avro-compatible (no future migration). Redpanda/Debezium/Apicurio adapters are deferred to the broker-wiring sprint (D-A). (Sprint 0.6; no ADR — defers adapters the contract already names, without changing its rules.)
- **Reason:** YAGNI + the current environment has no broker/registry; avoids committing to a wire codec prematurely while keeping the contract stable.
- **Trade-offs:** No end-to-end broker test until the wiring sprint; the in-memory serializer encodes via JSON internally (test-only, not the production format).

### D-025 — Auth/authz seams as ports; minimal feature flags

- **Decision:** Authentication + authorization are **ports added to `@platform/contracts`** (`Principal`/`PrincipalKind`; `Authenticator` → `Principal | null`; `Permission`; `AccessControl` → `boolean`) — **no `@platform/security` package** and **no audit subsystem** (deferred until a real producer). `AuthenticationError` (401) + `AuthorizationError` (403) added to `@platform/utils` (single error home, D-005). `@platform/feature-flags` ships only `FeatureFlags` + `EvaluationContext` + `InMemoryFeatureFlags`; rollout/percentage/multivariate/targeting + the source of truth belong to the future Experimentation implementation. **No DI tokens** (consumers inject by constructor at their composition root). (Sprint 0.7; no ADR — contract docs 07/12/14 unchanged.)
- **Reason:** YAGNI — only seams with an immediate Phase-1 (1.x) consumer; provider-agnostic like 0.6; `@platform/contracts` stays a leaf because the ports return `Principal | null` / `boolean` (no `Result`/error coupling).
- **Trade-offs:** RBAC/Ory/Keto/audit/rollout deferred to focused later work; resource-level authz is added later via an optional argument (non-breaking).

### D-026 — Phase-1 bounded-context conventions (Catalog + Media)

- **Decision:** Business contexts are independent `services/<context>/` Clean-Architecture slices. (a) **VO factories return `Result`** for expected input validation (via `Guard`); **aggregate invariant violations throw `DomainError`** (caught by the use-case into the `Result` channel) — matching `UseCase` semantics. (b) **Value objects are context-local** (`Money`, `Slug`, …) until ≥3 contexts need identical semantics (rule of three), then promoted to the shared kernel. (c) **Cross-context references are bare ids** (`MediaRef` → a Media asset id); no cross-context source import or DB FK. (d) **Interfaces are framework-agnostic** — controllers + a `present()` mapper (`Result` → status + the `@platform/utils` error envelope); no HTTP server yet. (e) **In-memory persistence + outbox** (Prisma/broker deferred). (Sprint 1.1; no ADR — conforms to docs/architecture/02–05 + the 0.5 design.)
- **Reason:** YAGNI + bounded-context independence; extend the existing kernel/contracts/messaging rather than add abstractions; keep `pnpm arch` green.
- **Trade-offs:** No real ACID/durability until Prisma is wired; minor `present()` duplication across contexts (promote to a shared interfaces-kit when HTTP lands).

### D-027 — Pricing + Inventory conventions (Sprint 1.2)

- **Decision:** Extends D-026 for two more contexts. (a) **`Money` stays context-local** — now duplicated in Catalog + Pricing (2 contexts); promote to the shared kernel only at the **third** consumer (rule of three). `Currency` is a new Pricing-local VO. (b) **Inventory emits a single `inventory.adjusted` integration event** carrying a `reason` (`received`/`adjusted`/`reserved`/`released`) + resulting levels — covering all stock mutations; separate `stock.reserved`/`released`/`low` events are deferred (per the 1.2 scope). (c) **`StockLevel` is a rich immutable VO** whose `receive`/`reserve`/`release`/`adjustTo` return new levels and throw `BusinessRuleError` on invariant violations (caught into the `Result` channel). (d) Cross-context refs by bare id (`ProductRef` in both contexts; reservation order/cart reference). (Sprint 1.2; no ADR — conforms to docs/architecture/02–05, the 0.5 design, and D-026.)
- **Reason:** YAGNI + bounded-context independence; reuse the kernel/messaging; keep `pnpm arch` green.
- **Trade-offs:** `Money`/`present()`/`InMemoryUnitOfWork`/`ProductRef` now duplicated across Phase-1 contexts — candidates for kernel/shared-kit promotion once shapes stabilise (deferred).
