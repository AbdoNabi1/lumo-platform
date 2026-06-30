import { ValidationError, ValueObject } from "@platform/domain";
import { err, ok, type Result } from "@platform/types";

interface MoneyProps {
  readonly amountMinor: number;
  readonly currency: string;
}

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/**
 * A monetary amount in integer minor units (e.g. cents) plus an ISO-4217 currency code. Context
 * local to Catalog for now; promote to the shared kernel under the rule of three (≥3 contexts).
 */
export class Money extends ValueObject<MoneyProps> {
  static create(amountMinor: number, currency: string): Result<Money, ValidationError> {
    const issues: { readonly field: string; readonly message: string }[] = [];
    if (!Number.isInteger(amountMinor)) {
      issues.push({ field: "amountMinor", message: "must be an integer (minor units)" });
    }
    if (!CURRENCY_PATTERN.test(currency)) {
      issues.push({ field: "currency", message: "must be a 3-letter ISO-4217 code" });
    }
    if (issues.length > 0) {
      return err(new ValidationError("Invalid money", issues));
    }
    return ok(new Money({ amountMinor, currency }));
  }

  get amountMinor(): number {
    return this.props.amountMinor;
  }

  get currency(): string {
    return this.props.currency;
  }
}
