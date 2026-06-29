# @platform/contracts

Outbound **service contracts** — interfaces only. This is the dedicated home for cross-cutting
outbound ports the application depends on and infrastructure implements (`IdGenerator`, `Clock`).

## Rules

- **Interfaces only.** No implementations, no DI, no framework code, no business logic.
- **No runtime dependencies** (TypeScript types only) — this package is a dependency-graph leaf.
- **DI tokens do not live here.** They stay in `@platform/application` (co-located with the DI
  container). This package only declares the contracts; the application owns wiring.
- **Infrastructure adapters depend only on this package**, never on `@platform/application`.

See [ADR-0002](../../docs/architecture/adr/0002-outbound-ports-in-contracts-package.md) and
`docs/DECISIONS.md` (D-018). Persistence ports remain in `@platform/repository` (D-006).
