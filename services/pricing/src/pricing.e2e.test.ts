import { describe, expect, it } from "vitest";
import type { Clock, IdGenerator } from "@platform/contracts";
import { InMemoryEventSerializer } from "@platform/domain-events/testing";
import { wirePricing } from "./composition";

function sequentialIds(): IdGenerator {
  let counter = 0;
  return { generate: () => `id-${(counter += 1)}` };
}

const clock: Clock = { now: () => new Date("2026-06-30T00:00:00.000Z") };

function wire() {
  return wirePricing({
    serializer: new InMemoryEventSerializer(),
    idGenerator: sequentialIds(),
    clock,
  });
}

describe("pricing (end to end)", () => {
  it("creates + activates a price list, then creates + changes a price emitting price.changed", async () => {
    const app = wire();

    const list = await app.priceLists.create({ name: "Retail", currency: "USD" });
    expect(list.status).toBe(201);
    const listId = (list.body as { id: string }).id;
    expect((await app.priceLists.activate({ priceListId: listId })).status).toBe(200);

    const price = await app.prices.create({
      priceListId: listId,
      productId: "product-1",
      amountMinor: 1999,
      currency: "USD",
    });
    expect(price.status).toBe(201);
    const priceId = (price.body as { id: string }).id;

    const changed = await app.prices.change({ priceId, amountMinor: 1799, currency: "USD" });
    expect(changed.status).toBe(200);

    expect(await app.drainOutbox()).toBe(1);
    expect(app.deliveredEventTypes).toContain("pricing.price.changed");
  });

  it("rejects an invalid currency (422)", async () => {
    const app = wire();
    const response = await app.priceLists.create({ name: "Bad", currency: "dollars" });
    expect(response.status).toBe(422);
  });

  it("returns 404 when changing a missing price", async () => {
    const app = wire();
    const response = await app.prices.change({
      priceId: "missing",
      amountMinor: 100,
      currency: "USD",
    });
    expect(response.status).toBe(404);
  });
});
