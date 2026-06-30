import { describe, expect, it } from "vitest";
import { Currency } from "./currency";
import { Money } from "./money";
import { ProductRef } from "./product-ref";

describe("Currency", () => {
  it("accepts ISO-4217 codes and rejects others", () => {
    expect(Currency.create("USD").ok).toBe(true);
    expect(Currency.create("us").ok).toBe(false);
    expect(Currency.create("usd").ok).toBe(false);
  });
});

describe("Money", () => {
  it("requires integer minor units", () => {
    const usd = Currency.create("USD");
    if (!usd.ok) throw new Error("invalid fixture");
    expect(Money.create(1999, usd.value).ok).toBe(true);
    expect(Money.create(19.99, usd.value).ok).toBe(false);
  });
});

describe("ProductRef", () => {
  it("rejects blank ids", () => {
    expect(ProductRef.create("product-1").ok).toBe(true);
    expect(ProductRef.create("  ").ok).toBe(false);
  });
});
