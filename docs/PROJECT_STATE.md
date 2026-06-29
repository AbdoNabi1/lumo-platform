# PROJECT_STATE

> Current state only — kept short. Updated at the end of every sprint. As of **2026-06-29**.

## Current sprint

**None active** (Phase 0). Last completed: **Sprint 0.6 — Event Backbone** (validated). Awaiting approval to start Sprint 0.7.

## Completed sprints

| Sprint | Scope                                                                                                                                                                                   | Validation                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 0.1    | Monorepo foundation (Turborepo/pnpm, shared packages, tooling, CI, Docker)                                                                                                              | ✅ green                                                                          |
| 0.2    | Infrastructure foundation (db/redis/clickhouse/storage/secrets/observability/health + config server)                                                                                    | ✅ lint/typecheck/test/build green (live Docker checks deferred — no Docker host) |
| 0.3    | Application-layer foundation (DI, CQRS buses, UseCase, middleware, repo ports, Prisma adapter, Result/Either, domain errors)                                                            | ✅ green (36 tests)                                                               |
| 0.4    | Domain foundation (`@platform/domain`) + ID/Clock abstractions (`@platform/contracts` ports, `@platform/id` UUIDv7, `@platform/clock`)                                                  | ✅ green (32 tests)                                                               |
| 0.5    | Phase 1 Commerce Core business-layer design (documentation only)                                                                                                                        | n/a (design)                                                                      |
| 0.6    | Event backbone — `@platform/domain-events` (integration-event contracts) + `@platform/messaging` (outbox/publisher/consumer/idempotency/retry/DLQ, in-memory adapters); broker-agnostic | ✅ green (22 tests)                                                               |

> **0.4 post-review hardening (2026-06-29):** review findings M1–M5 + L1 resolved — added `@platform/contracts` (outbound port interfaces) and `@platform/clock`; `@platform/id` now emits UUIDv7; value objects deep-frozen; `UniqueEntityId` rejects empty/blank; `AggregateRoot.pullDomainEvents()` added. All gates green (domain 28, id 3, clock 1). See [SPRINT_0_4_REPORT.md](implementation/SPRINT_0_4_REPORT.md) §10.

## Next sprint

**Sprint 0.7 — auth foundation + cross-cutting seams** (Ory; audit-log, feature-flag, and tenancy seams). Then 0.8 (dependency-cruiser fitness functions + generators + walking skeleton) → Phase 1 contexts (1.1–1.6). Awaiting approval.

> **Deferred to the broker-wiring sprint:** Redpanda publisher/consumer adapters, Debezium connectors, Apicurio + Avro/Protobuf `EventSerializer`, Prisma adapters for the outbox/processed/DLQ stores, live-broker integration tests (need a Docker host).

## Pending work

- Sprint 0.2 live infrastructure validation on a Docker-capable host.
- (Recommended) dependency-cruiser fitness functions enforcing layer boundaries in CI.

## Future planned sprints (Phase 0 → Phase 1)

1. Event/messaging backbone (Redpanda + transactional outbox + schema registry).
2. Auth foundation (Ory).
3. "hello-domain" service wiring domain + application + infrastructure (Phase-0 exit criteria).
4. Phase 1 — Commerce core (catalog, pricing, inventory, cart, checkout, orders, payments, identity).
