import { describe, expect, it } from "vitest";
import { BusinessRuleError, UniqueEntityId } from "@platform/domain";
import { Price } from "./price";
import { PriceList } from "./price-list";
import { Currency } from "./value-objects/currency";
import { Money } from "./value-objects/money";
import { ProductRef } from "./value-objects/product-ref";

function usd(amount: number): Money {
  const currency = Currency.create("USD");
  if (!currency.ok) throw new Error("invalid fixture");
  const money = Money.create(amount, currency.value);
  if (!money.ok) throw new Error("invalid fixture");
  return money.value;
}

function productRef(): ProductRef {
  const ref = ProductRef.create("product-1");
  if (!ref.ok) throw new Error("invalid fixture");
  return ref.value;
}

describe("Price", () => {
  it("emits price.changed when the amount changes", () => {
    const price = Price.create(UniqueEntityId.from("price-1"), "list-1", productRef(), usd(1999));
    price.change(usd(1799), "evt-1", new Date("2026-06-30T00:00:00.000Z"));

    expect(price.amount.amountMinor).toBe(1799);
    const events = price.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventName).toBe("price.changed");
  });
});

describe("PriceList", () => {
  it("activates a draft and rejects double activation", () => {
    const currency = Currency.create("USD");
    if (!currency.ok) throw new Error("invalid fixture");
    const list = PriceList.create(UniqueEntityId.from("list-1"), "Retail", currency.value);

    expect(list.status).toBe("draft");
    list.activate();
    expect(list.status).toBe("active");
    expect(() => list.activate()).toThrow(BusinessRuleError);
  });
});
