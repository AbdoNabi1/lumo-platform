import { AggregateRoot, type UniqueEntityId } from "@platform/domain";
import { PriceChanged } from "./events/price-changed.event";
import type { Money } from "./value-objects/money";
import type { ProductRef } from "./value-objects/product-ref";

interface PriceProps {
  readonly priceListId: string;
  readonly product: ProductRef;
  amount: Money;
}

/** A product's price within a price list. Emits `price.changed` when the amount changes. */
export class Price extends AggregateRoot<PriceProps> {
  static create(
    id: UniqueEntityId,
    priceListId: string,
    product: ProductRef,
    amount: Money,
  ): Price {
    return new Price({ priceListId, product, amount }, id);
  }

  change(amount: Money, eventId: string, occurredAt: Date): void {
    this.props.amount = amount;
    this.addDomainEvent(
      new PriceChanged(
        { eventId, aggregateId: this.id, occurredAt },
        {
          priceListId: this.props.priceListId,
          productId: this.props.product.value,
          amountMinor: amount.amountMinor,
          currency: amount.currency.code,
        },
      ),
    );
  }

  get priceListId(): string {
    return this.props.priceListId;
  }

  get product(): ProductRef {
    return this.props.product;
  }

  get amount(): Money {
    return this.props.amount;
  }
}
