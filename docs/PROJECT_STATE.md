# PROJECT_STATE

> Current state only — kept short. Updated at the end of every sprint. As of **2026-06-29**.

## Current sprint

**None active** — **Phase 1 underway.** Last completed: **Sprint 1.1 — Commerce Core (Catalog + Media)** (validated). Awaiting approval to begin Sprint 1.2.

## Completed sprints

| Sprint | Scope                                                                                                                                                                                                                                   | Validation                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 0.1    | Monorepo foundation (Turborepo/pnpm, shared packages, tooling, CI, Docker)                                                                                                                                                              | ✅ green                                                                          |
| 0.2    | Infrastructure foundation (db/redis/clickhouse/storage/secrets/observability/health + config server)                                                                                                                                    | ✅ lint/typecheck/test/build green (live Docker checks deferred — no Docker host) |
| 0.3    | Application-layer foundation (DI, CQRS buses, UseCase, middleware, repo ports, Prisma adapter, Result/Either, domain errors)                                                                                                            | ✅ green (36 tests)                                                               |
| 0.4    | Domain foundation (`@platform/domain`) + ID/Clock abstractions (`@platform/contracts` ports, `@platform/id` UUIDv7, `@platform/clock`)                                                                                                  | ✅ green (32 tests)                                                               |
| 0.5    | Phase 1 Commerce Core business-layer design (documentation only)                                                                                                                                                                        | n/a (design)                                                                      |
| 0.6    | Event backbone — `@platform/domain-events` (integration-event contracts) + `@platform/messaging` (outbox/publisher/consumer/idempotency/retry/DLQ, in-memory adapters); broker-agnostic                                                 | ✅ green (22 tests)                                                               |
| 0.7    | Auth/authz **ports** in `@platform/contracts` (`Principal`/`Authenticator`/`Permission`/`AccessControl`) + `AuthenticationError`/`AuthorizationError` in `@platform/utils` + `@platform/feature-flags` (minimal `InMemoryFeatureFlags`) | ✅ green (utils 5, flags 3)                                                       |
| 0.8    | Fitness functions (`dependency-cruiser` + `pnpm arch` + CI gate), generators (`turbo gen`: package/service/aggregate/use-case), walking skeleton `services/example` (API→app→domain→repo→outbox→messaging)                              | ✅ green (example 4 tests; arch 0 violations)                                     |
| 1.1    | Commerce Core — `@platform/catalog` (Product/Variant/Category, `product.*` events) + `@platform/media` (Asset, `media.asset_ready`); in-memory persistence + outbox; no cross-context imports (`MediaRef` by id)                        | ✅ green (catalog 12, media 3; arch 0 violations)                                 |

> **0.4 post-review hardening (2026-06-29):** review findings M1–M5 + L1 resolved — added `@platform/contracts` (outbound port interfaces) and `@platform/clock`; `@platform/id` now emits UUIDv7; value objects deep-frozen; `UniqueEntityId` rejects empty/blank; `AggregateRoot.pullDomainEvents()` added. All gates green (domain 28, id 3, clock 1). See [SPRINT_0_4_REPORT.md](implementation/SPRINT_0_4_REPORT.md) §10.

## Next sprint

**Sprint 1.2 — Pricing + Inventory** (per the roadmap). Awaiting approval. (Deferred, picked up when a Docker host is available: Prisma persistence + per-context Postgres schemas, S3/MinIO for Media, Redpanda/Debezium broker wiring, HTTP/GraphQL + gRPC transport, audit/Ory/Keto, flag rollout engine.)

> **Deferred to the broker-wiring sprint:** Redpanda publisher/consumer adapters, Debezium connectors, Apicurio + Avro/Protobuf `EventSerializer`, Prisma adapters for the outbox/processed/DLQ stores, live-broker integration tests (need a Docker host).

## Pending work

- Sprint 0.2 live infrastructure validation on a Docker-capable host.
- Broker/deploy wiring (Redpanda/Debezium/Apicurio, Prisma outbox stores, GitOps/k8s) — the deploy half of the Phase-0 exit criteria; needs a Docker host.

## Future planned sprints (Phase 0 → Phase 1)

1. Event/messaging backbone (Redpanda + transactional outbox + schema registry).
2. Auth foundation (Ory).
3. "hello-domain" service wiring domain + application + infrastructure (Phase-0 exit criteria).
4. Phase 1 — Commerce core (catalog, pricing, inventory, cart, checkout, orders, payments, identity).
