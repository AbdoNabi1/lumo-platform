import type { UseCase } from "@platform/application";
import type { Clock, IdGenerator } from "@platform/contracts";
import type { TransactionalUnitOfWork } from "@platform/repository";
import { err, ok, type Result } from "@platform/types";
import { type DomainError, NotFoundError } from "@platform/utils";
import type { PriceRepository } from "../domain/price-repository";
import { Currency } from "../domain/value-objects/currency";
import { Money } from "../domain/value-objects/money";

export interface ChangePriceInput {
  readonly priceId: string;
  readonly amountMinor: number;
  readonly currency: string;
}

export interface ChangePriceOutput {
  readonly id: string;
}

export interface ChangePriceDeps {
  readonly prices: PriceRepository;
  readonly unitOfWork: TransactionalUnitOfWork<unknown>;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
}

/** Changes a price's amount, emitting `price.changed`. */
export class ChangePrice implements UseCase<ChangePriceInput, ChangePriceOutput, DomainError> {
  private readonly deps: ChangePriceDeps;

  constructor(deps: ChangePriceDeps) {
    this.deps = deps;
  }

  async execute(input: ChangePriceInput): Promise<Result<ChangePriceOutput, DomainError>> {
    const currency = Currency.create(input.currency);
    if (!currency.ok) return err(currency.error);
    const amount = Money.create(input.amountMinor, currency.value);
    if (!amount.ok) return err(amount.error);

    return this.deps.unitOfWork.run<Result<ChangePriceOutput, DomainError>>(async () => {
      const price = await this.deps.prices.findById(input.priceId);
      if (price === null) {
        return err(new NotFoundError("Price not found"));
      }

      price.change(amount.value, this.deps.idGenerator.generate(), this.deps.clock.now());
      await this.deps.prices.save(price);
      return ok({ id: price.id.toString() });
    });
  }
}
