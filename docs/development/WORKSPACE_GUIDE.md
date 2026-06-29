# Workspace guide

A Turborepo + pnpm monorepo. Workspaces are globbed in `pnpm-workspace.yaml`: `apps/*`,
`packages/*`, `services/*`.

## Apps

| App | Stack | Notes |
|---|---|---|
| `storefront` | Next.js 15 + React 19 + Tailwind v4 | Foundation shell (no business pages yet) |

> The admin app (React + Vite, per `docs/architecture/01`) and its **frozen** UI
> (`docs/ui/`) are introduced in a later sprint — not in Sprint 0.1.

## Shared packages

| Package | Responsibility |
|---|---|
| `@platform/ui` | shadcn/ui base primitives, theme provider, `cn`. No business components. |
| `@platform/design` | Design tokens — encodes the **frozen** UI design system (`docs/ui/DESIGN_SYSTEM.md`). |
| `@platform/types` | Generic TypeScript utility types. |
| `@platform/utils` | Logging foundation + global error helpers. |
| `@platform/config` | Typed env schema/loader + feature-flag infrastructure. |
| `@platform/tracking` | Shared tracking **types** (event envelope) — no events/logic. |
| `@platform/eslint-config` | Shared ESLint 9 flat configs (base + Next). |
| `@platform/tsconfig` | Shared TypeScript base configs. |
| `@platform/prettier-config` | Shared Prettier config. |

## Dependency rules (enforced by convention now; CI fitness functions later)

- Packages never import from `apps/` or `services/`.
- Apps/services import packages; never each other's internals.
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
