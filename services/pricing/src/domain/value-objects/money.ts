import { ValidationError, ValueObject } from "@platform/domain";
import { err, ok, type Result } from "@platform/types";
import type { Currency } from "./currency";

interface MoneyProps {
  readonly amountMinor: number;
  readonly currency: Currency;
}

/**
 * A monetary amount in integer minor units plus a {@link Currency}. Context-local to Pricing.
 * Now present in two contexts (Catalog, Pricing); promote to the shared kernel only at the third
 * (rule of three).
 */
export class Money extends ValueObject<MoneyProps> {
  static create(amountMinor: number, currency: Currency): Result<Money, ValidationError> {
    if (!Number.isInteger(amountMinor)) {
      return err(
        new ValidationError("Invalid money", [
          { field: "amountMinor", message: "must be an integer (minor units)" },
        ]),
      );
    }
    return ok(new Money({ amountMinor, currency }));
  }

  get amountMinor(): number {
    return this.props.amountMinor;
  }

  get currency(): Currency {
    return this.props.currency;
  }
}
