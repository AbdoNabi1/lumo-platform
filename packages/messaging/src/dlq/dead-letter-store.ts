/** A message that exhausted its retries, captured for inspection and later redelivery. */
export interface DeadLetterEntry {
  readonly messageId: string;
  readonly topic: string;
  readonly value: Uint8Array;
  readonly headers: Readonly<Record<string, string>>;
  readonly attempts: number;
  readonly error: string;
  readonly failedAt: string;
}

/**
 * Stores dead-lettered messages (docs/architecture/05 §2). The production adapter (Prisma/topic)
 * + alerting are added in the broker-wiring sprint; local/tests use the in-memory store.
 */
export interface DeadLetterStore {
  add(entry: DeadLetterEntry): Promise<void>;
}
