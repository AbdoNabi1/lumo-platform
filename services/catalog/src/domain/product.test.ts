import { describe, expect, it } from "vitest";
import { BusinessRuleError, UniqueEntityId } from "@platform/domain";
import { Product } from "./product";
import { Variant } from "./variant";
import { Money } from "./value-objects/money";
import { Sku } from "./value-objects/sku";
import { Slug } from "./value-objects/slug";

function variantFixture(): Variant {
  const sku = Sku.create("SKU-1");
  const price = Money.create(1999, "USD");
  if (!sku.ok || !price.ok) throw new Error("invalid fixture");
  return Variant.create(UniqueEntityId.from("variant-1"), sku.value, price.value);
}

function productFixture(): Product {
  const sku = Sku.create("P-1");
  const slug = Slug.create("toy-wagon");
  if (!sku.ok || !slug.ok) throw new Error("invalid fixture");
  return Product.create(UniqueEntityId.from("product-1"), {
    sku: sku.value,
    name: "Toy Wagon",
    slug: slug.value,
    variants: [variantFixture()],
  });
}

describe("Product", () => {
  it("is created as a draft with no events", () => {
    const product = productFixture();
    expect(product.status.value).toBe("draft");
    expect(product.pullDomainEvents()).toHaveLength(0);
  });

  it("publishes and emits product.published", () => {
    const product = productFixture();
    product.publish("evt-1", new Date("2026-06-30T00:00:00.000Z"));

    expect(product.status.isPublished).toBe(true);
    const events = product.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventName).toBe("product.published");
  });

  it("rejects publishing twice", () => {
    const product = productFixture();
    product.publish("evt-1", new Date(0));
    product.pullDomainEvents();
    expect(() => product.publish("evt-2", new Date(0))).toThrow(BusinessRuleError);
  });

  it("requires at least one variant", () => {
    const sku = Sku.create("P-2");
    const slug = Slug.create("empty");
    if (!sku.ok || !slug.ok) throw new Error("invalid fixture");
    expect(() =>
      Product.create(UniqueEntityId.from("product-2"), {
        sku: sku.value,
        name: "Empty",
        slug: slug.value,
        variants: [],
      }),
    ).toThrow(BusinessRuleError);
  });

  it("updates and emits product.updated", () => {
    const product = productFixture();
    const slug = Slug.create("new-slug");
    if (!slug.ok) throw new Error("invalid fixture");
    product.update("New Name", slug.value, "evt-3", new Date(0));

    expect(product.name).toBe("New Name");
    expect(product.pullDomainEvents()[0]?.eventName).toBe("product.updated");
  });
});
