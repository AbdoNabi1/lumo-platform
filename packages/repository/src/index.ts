import type { Paginated } from "@platform/types";

/**
 * Generic persistence abstractions (ports). Interfaces ONLY — no concrete repositories or
 * implementations. Domain repositories implement these per bounded context in later sprints,
 * keeping persistence behind a port (clean architecture, docs/architecture/02). The Prisma
 * adapter foundation that implements these lives in the infrastructure package `@platform/db`.
 */

/** A persistence port for an aggregate of type `TEntity` keyed by `TId`. */
export interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}

/** Groups repository operations into a single atomic transaction boundary. */
export interface UnitOfWork {
  run<T>(work: () => Promise<T>): Promise<T>;
}

/** Cursor pagination arguments (cursor-only per docs/architecture/04 §2). */
export interface CursorPage {
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
}

/** Read side of a persistence port. */
export interface ReadRepository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  exists(id: TId): Promise<boolean>;
  findPage(page: CursorPage): Promise<Paginated<TEntity>>;
}

/** Write side of a persistence port. */
export interface WriteRepository<TEntity, TId> {
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}

/**
 * A transaction boundary that exposes the transaction-scoped context to the work callback
 * (e.g. a Prisma interactive transaction client). Implemented by an infrastructure adapter.
 */
export interface TransactionalUnitOfWork<TContext> {
  run<T>(work: (context: TContext) => Promise<T>): Promise<T>;
}
