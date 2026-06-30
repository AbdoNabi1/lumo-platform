import { describe, expect, it } from "vitest";
import type { Clock, IdGenerator } from "@platform/contracts";
import { InMemoryEventSerializer } from "@platform/domain-events/testing";
import { wireCatalog } from "./composition";

function sequentialIds(): IdGenerator {
  let counter = 0;
  return { generate: () => `id-${(counter += 1)}` };
}

const clock: Clock = { now: () => new Date("2026-06-30T00:00:00.000Z") };

function wire() {
  return wireCatalog({
    serializer: new InMemoryEventSerializer(),
    idGenerator: sequentialIds(),
    clock,
  });
}

describe("catalog (end to end)", () => {
  it("creates and publishes a product, emitting product.published via the outbox", async () => {
    const app = wire();

    const created = await app.products.create({
      sku: "P-1",
      name: "Toy Wagon",
      slug: "toy-wagon",
      variants: [{ sku: "P-1-RED", priceAmountMinor: 1999, currency: "USD" }],
    });
    expect(created.status).toBe(201);
    const { id } = created.body as { id: string };

    const published = await app.products.publish({ productId: id });
    expect(published.status).toBe(200);

    const count = await app.drainOutbox();
    expect(count).toBe(1);
    expect(app.deliveredEventTypes).toContain("catalog.product.published");
  });

  it("rejects an invalid slug at the boundary (422)", async () => {
    const app = wire();
    const response = await app.products.create({
      sku: "P-2",
      name: "Bad",
      slug: "Bad Slug",
      variants: [{ sku: "P-2-A", priceAmountMinor: 100, currency: "USD" }],
    });
    expect(response.status).toBe(422);
  });

  it("returns 404 when publishing a missing product", async () => {
    const app = wire();
    const response = await app.products.publish({ productId: "missing" });
    expect(response.status).toBe(404);
  });

  it("creates a category", async () => {
    const app = wire();
    const response = await app.categories.create({ name: "Outdoor", slug: "outdoor" });
    expect(response.status).toBe(201);
  });
});
