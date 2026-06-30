import { Entity, type UniqueEntityId } from "@platform/domain";
import type { Money } from "./value-objects/money";
import type { Sku } from "./value-objects/sku";

interface VariantProps {
  readonly sku: Sku;
  readonly price: Money;
}

/** A purchasable variant of a product (identity by id). */
export class Variant extends Entity<VariantProps> {
  static create(id: UniqueEntityId, sku: Sku, price: Money): Variant {
    return new Variant({ sku, price }, id);
  }

  get sku(): Sku {
    return this.props.sku;
  }

  get price(): Money {
    return this.props.price;
  }
}
