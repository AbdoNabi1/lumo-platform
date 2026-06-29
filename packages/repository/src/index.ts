/**
 * Generic persistence abstractions (Sprint 0.2 infrastructure).
 * Interfaces ONLY — no concrete repositories or implementations. Domain repositories
 * implement these per bounded context in later sprints, keeping persistence behind a port
 * (clean architecture, docs/architecture/02).
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
