import type { Clock } from "@platform/contracts";
import type { EventSerializer, SerializedEnvelope } from "@platform/domain-events";
import type { Logger } from "@platform/utils";
import type { DeadLetterStore } from "../dlq/dead-letter-store";
import type { ProcessedEventStore } from "../idempotency/processed-event-store";
import type { RetryPolicy } from "../retry/retry-policy";
import type { EventHandler } from "./event-handler";
import type { IncomingMessage } from "./incoming-message";

export interface EventConsumerDeps {
  readonly serializer: EventSerializer;
  readonly processedEvents: ProcessedEventStore;
  readonly deadLetters: DeadLetterStore;
  readonly retryPolicy: RetryPolicy;
  readonly clock: Clock;
  readonly logger: Logger;
  /** Delays between retries; injected so tests stay deterministic and production controls timing. */
  readonly sleep: (ms: number) => Promise<void>;
}

/**
 * Turns a raw broker message into a typed, idempotent, retried handler call. Transport-agnostic: a
 * broker adapter (Redpanda, later) feeds it `IncomingMessage`s; tests feed them directly.
 *
 * Flow: deserialize → idempotency check (skip if already processed) → handle → record processed.
 * On handler failure it retries with bounded backoff; on exhaustion the message is dead-lettered
 * and acknowledged. Idempotency is keyed by `messageId`, so redelivery is safe.
 */
export class EventConsumer<TPayload> {
  private readonly handler: EventHandler<TPayload>;
  private readonly deps: EventConsumerDeps;

  constructor(handler: EventHandler<TPayload>, deps: EventConsumerDeps) {
    this.handler = handler;
    this.deps = deps;
  }

  async consume(message: IncomingMessage): Promise<void> {
    const event = this.deps.serializer.deserialize<TPayload>(toSerialized(message));

    if (await this.deps.processedEvents.has(event.messageId)) {
      return;
    }

    for (let attempt = 1; ; attempt += 1) {
      try {
        await this.handler.handle(event);
        await this.deps.processedEvents.record(
          event.messageId,
          this.deps.clock.now().toISOString(),
        );
        return;
      } catch (error) {
        if (attempt >= this.deps.retryPolicy.maxAttempts) {
          await this.deps.deadLetters.add({
            messageId: event.messageId,
            topic: message.topic,
            value: message.value,
            headers: message.headers,
            attempts: attempt,
            error: errorMessage(error),
            failedAt: this.deps.clock.now().toISOString(),
          });
          this.deps.logger.error("integration event dead-lettered", {
            messageId: event.messageId,
            topic: message.topic,
            attempts: attempt,
          });
          return;
        }
        this.deps.logger.warn("integration event handler failed; retrying", {
          messageId: event.messageId,
          topic: message.topic,
          attempt,
        });
        await this.deps.sleep(this.deps.retryPolicy.delayForAttempt(attempt));
      }
    }
  }
}

function toSerialized(message: IncomingMessage): SerializedEnvelope {
  return {
    type: message.headers.type ?? "",
    eventVersion: Number(message.headers.eventVersion ?? "0"),
    contentType: message.headers.contentType ?? "",
    data: message.value,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
