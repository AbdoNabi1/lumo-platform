import { describe, expect, it } from "vitest";
import { InMemoryProcessedEventStore } from "./in-memory-processed-event-store";

describe("InMemoryProcessedEventStore", () => {
  it("records and detects processed ids; record is idempotent", async () => {
    const store = new InMemoryProcessedEventStore();

    expect(await store.has("m1")).toBe(false);
    await store.record("m1", "2026-06-29T00:00:00.000Z");
    expect(await store.has("m1")).toBe(true);

    await store.record("m1", "2026-06-29T01:00:00.000Z"); // idempotent — no throw, no change
    expect(await store.has("m1")).toBe(true);
  });
});
