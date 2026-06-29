import type { OutboxEntry } from "./outbox-entry";

/**
 * Persistence port for the transactional outbox. `append` MUST run inside the same transaction as
 * the aggregate write (so the events and the state change commit atomically). The production
 * adapter (Prisma) is added with the first persistent context; local/tests use
 * `InMemoryOutboxStore`. `TTx` is the transaction context (e.g. a Prisma transaction client); the
 * in-memory store ignores it.
 */
export interface OutboxStore<TTx = unknown> {
  append(entries: readonly OutboxEntry[], tx: TTx): Promise<void>;
  fetchPending(limit: number): Promise<readonly OutboxEntry[]>;
  markPublished(ids: readonly string[], publishedAt: string): Promise<void>;
}
