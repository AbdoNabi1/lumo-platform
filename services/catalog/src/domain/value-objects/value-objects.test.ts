import { describe, expect, it } from "vitest";
import { Money } from "./money";
import { Sku } from "./sku";
import { Slug } from "./slug";

describe("Sku", () => {
  it("accepts a non-empty value and rejects blank", () => {
    expect(Sku.create("ABC-1").ok).toBe(true);
    expect(Sku.create("   ").ok).toBe(false);
  });
});

describe("Slug", () => {
  it("accepts lower kebab-case and rejects other shapes", () => {
    expect(Slug.create("red-wagon").ok).toBe(true);
    expect(Slug.create("Red Wagon").ok).toBe(false);
    expect(Slug.create("-leading").ok).toBe(false);
  });
});

describe("Money", () => {
  it("requires integer minor units and a 3-letter ISO currency", () => {
    expect(Money.create(1999, "USD").ok).toBe(true);
    expect(Money.create(19.99, "USD").ok).toBe(false);
    expect(Money.create(100, "us").ok).toBe(false);
  });
});
