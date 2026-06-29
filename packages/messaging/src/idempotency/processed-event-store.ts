/**
 * Records which integration events (by `messageId`) have been processed — the idempotency guard
 * that makes redelivery safe (docs/architecture/05 §1.1). `record` is idempotent, so a context may
 * also call it inside its handler's own transaction for exactly-once *effect*. The production
 * adapter (Prisma) is added with the first consuming context; local/tests use the in-memory store.
 */
export interface ProcessedEventStore {
  has(messageId: string): Promise<boolean>;
  record(messageId: string, processedAt: string): Promise<void>;
}
