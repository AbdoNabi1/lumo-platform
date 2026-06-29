import type { IntegrationEvent } from "@platform/domain-events";

/**
 * Handles a single integration-event type. Implemented per consuming context. `eventType` /
 * `eventVersion` declare the subscription a broker adapter routes to. Handlers should be idempotent
 * (the `ProcessedEventStore` dedupes redelivery, but handlers must tolerate at-least-once).
 */
export interface EventHandler<TPayload> {
  readonly eventType: string;
  readonly eventVersion: number;
  handle(event: IntegrationEvent<TPayload>): Promise<void>;
}
