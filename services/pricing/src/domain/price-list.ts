import { AggregateRoot, BusinessRuleError, type UniqueEntityId } from "@platform/domain";
import type { Currency } from "./value-objects/currency";

export type PriceListStatus = "draft" | "active";

interface PriceListProps {
  readonly name: string;
  readonly currency: Currency;
  status: PriceListStatus;
}

/** A named collection of prices in a single currency. Created as a draft, then activated. */
export class PriceList extends AggregateRoot<PriceListProps> {
  static create(id: UniqueEntityId, name: string, currency: Currency): PriceList {
    return new PriceList({ name, currency, status: "draft" }, id);
  }

  activate(): void {
    if (this.props.status === "active") {
      throw new BusinessRuleError("Price list is already active");
    }
    this.props.status = "active";
  }

  get name(): string {
    return this.props.name;
  }

  get currency(): Currency {
    return this.props.currency;
  }

  get status(): PriceListStatus {
    return this.props.status;
  }
}
