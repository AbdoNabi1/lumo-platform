import type { ProcessedEventStore } from "./processed-event-store";

/** In-memory `ProcessedEventStore` for local development and tests. Not for production. */
export class InMemoryProcessedEventStore implements ProcessedEventStore {
  private readonly processed = new Map<string, string>();

  async has(messageId: string): Promise<boolean> {
    return this.processed.has(messageId);
  }

  async record(messageId: string, processedAt: string): Promise<void> {
    if (!this.processed.has(messageId)) {
      this.processed.set(messageId, processedAt);
    }
  }
}
