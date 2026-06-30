import { describe, expect, it } from "vitest";
import type { Clock, IdGenerator } from "@platform/contracts";
import { InMemoryEventSerializer } from "@platform/domain-events/testing";
import { wireInventory } from "./composition";

function sequentialIds(): IdGenerator {
  let counter = 0;
  return { generate: () => `id-${(counter += 1)}` };
}

const clock: Clock = { now: () => new Date("2026-06-30T00:00:00.000Z") };

function wire() {
  return wireInventory({
    serializer: new InMemoryEventSerializer(),
    idGenerator: sequentialIds(),
    clock,
  });
}

describe("inventory (end to end)", () => {
  it("receives then reserves stock, emitting inventory.adjusted via the outbox", async () => {
    const app = wire();

    const received = await app.inventory.receive({
      productId: "product-1",
      warehouseId: "wh-1",
      quantity: 10,
    });
    expect(received.status).toBe(200);

    const reserved = await app.inventory.reserve({
      productId: "product-1",
      warehouseId: "wh-1",
      quantity: 4,
      reference: "order-1",
    });
    expect(reserved.status).toBe(201);
    expect((reserved.body as { available: number }).available).toBe(6);

    const count = await app.drainOutbox();
    expect(count).toBe(2); // received + reserved
    expect(app.deliveredEventTypes).toContain("inventory.inventory_item.adjusted");
  });

  it("rejects reserving more than available (409)", async () => {
    const app = wire();
    await app.inventory.receive({ productId: "product-2", warehouseId: "wh-1", quantity: 3 });

    const response = await app.inventory.reserve({
      productId: "product-2",
      warehouseId: "wh-1",
      quantity: 5,
      reference: "order-2",
    });
    expect(response.status).toBe(409);
  });

  it("returns 404 when reserving an unknown item", async () => {
    const app = wire();
    const response = await app.inventory.reserve({
      productId: "missing",
      warehouseId: "wh-1",
      quantity: 1,
      reference: "order-3",
    });
    expect(response.status).toBe(404);
  });

  it("rejects an invalid quantity (422)", async () => {
    const app = wire();
    const response = await app.inventory.receive({
      productId: "product-3",
      warehouseId: "wh-1",
      quantity: 0,
    });
    expect(response.status).toBe(422);
  });
});
