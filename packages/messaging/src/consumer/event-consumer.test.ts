import { describe, expect, it } from "vitest";
import type { Clock } from "@platform/contracts";
import type { IntegrationEvent } from "@platform/domain-events";
import { InMemoryEventSerializer } from "@platform/domain-events/testing";
import type { Logger } from "@platform/utils";
import { InMemoryDeadLetterStore } from "../dlq/in-memory-dead-letter-store";
import { InMemoryProcessedEventStore } from "../idempotency/in-memory-processed-event-store";
import { RetryPolicy } from "../retry/retry-policy";
import { EventConsumer, type EventConsumerDeps } from "./event-consumer";
import type { EventHandler } from "./event-handler";
import type { IncomingMessage } from "./incoming-message";

type OrderPayload = { total: number };

const clock: Clock = { now: () => new Date("2026-06-29T00:00:00.000Z") };
const serializer = new InMemoryEventSerializer();
const noSleep = async (): Promise<void> => {};

function silentLogger(): Logger {
  const log: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    child: () => log,
  };
  return log;
}

function message(total: number, messageId = "evt-1"): IncomingMessage {
  const envelope: IntegrationEvent<OrderPayload> = {
    messageId,
    type: "orders.order.placed",
    eventVersion: 1,
    aggregateId: "order-1",
    aggregateType: "order",
    occurredAt: "2026-06-29T00:00:00.000Z",
    correlationId: "c",
    causationId: "c",
    payload: { total },
    metadata: {},
  };
  const serialized = serializer.serialize(envelope);
  return {
    topic: "orders.order.placed.v1",
    key: "order-1",
    value: serialized.data,
    headers: {
      type: serialized.type,
      eventVersion: String(serialized.eventVersion),
      contentType: serialized.contentType,
    },
  };
}

function deps(overrides: Partial<EventConsumerDeps> = {}): EventConsumerDeps {
  return {
    serializer,
    processedEvents: new InMemoryProcessedEventStore(),
    deadLetters: new InMemoryDeadLetterStore(),
    retryPolicy: new RetryPolicy({
      maxAttempts: 3,
      baseDelayMs: 1,
      factor: 2,
      maxDelayMs: 10,
      jitter: () => 0,
    }),
    clock,
    logger: silentLogger(),
    sleep: noSleep,
    ...overrides,
  };
}

describe("EventConsumer", () => {
  it("handles a message once and records it as processed", async () => {
    const handled: number[] = [];
    const handler: EventHandler<OrderPayload> = {
      eventType: "orders.order.placed",
      eventVersion: 1,
      handle: async (event) => {
        handled.push(event.payload.total);
      },
    };
    const processedEvents = new InMemoryProcessedEventStore();

    await new EventConsumer(handler, deps({ processedEvents })).consume(message(100));

    expect(handled).toEqual([100]);
    expect(await processedEvents.has("evt-1")).toBe(true);
  });

  it("deduplicates redelivery of the same message", async () => {
    const handled: number[] = [];
    const handler: EventHandler<OrderPayload> = {
      eventType: "orders.order.placed",
      eventVersion: 1,
      handle: async (event) => {
        handled.push(event.payload.total);
      },
    };
    const consumer = new EventConsumer(
      handler,
      deps({ processedEvents: new InMemoryProcessedEventStore() }),
    );
    const msg = message(100);

    await consumer.consume(msg);
    await consumer.consume(msg);

    expect(handled).toEqual([100]);
  });

  it("retries a transient failure, then succeeds", async () => {
    let attempts = 0;
    const handler: EventHandler<OrderPayload> = {
      eventType: "orders.order.placed",
      eventVersion: 1,
      handle: async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error("transient");
        }
      },
    };

    await new EventConsumer(handler, deps()).consume(message(1));

    expect(attempts).toBe(3);
  });

  it("dead-letters a message after exhausting retries", async () => {
    const deadLetters = new InMemoryDeadLetterStore();
    const handler: EventHandler<OrderPayload> = {
      eventType: "orders.order.placed",
      eventVersion: 1,
      handle: async () => {
        throw new Error("always fails");
      },
    };

    await new EventConsumer(handler, deps({ deadLetters })).consume(message(1));

    expect(deadLetters.snapshot()).toHaveLength(1);
    expect(deadLetters.snapshot()[0]?.attempts).toBe(3);
    expect(deadLetters.snapshot()[0]?.error).toBe("always fails");
  });
});
