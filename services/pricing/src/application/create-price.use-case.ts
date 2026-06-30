import type { UseCase } from "@platform/application";
import type { IdGenerator } from "@platform/contracts";
import { UniqueEntityId } from "@platform/domain";
import type { TransactionalUnitOfWork } from "@platform/repository";
import { err, ok, type Result } from "@platform/types";
import type { DomainError } from "@platform/utils";
import { Price } from "../domain/price";
import type { PriceRepository } from "../domain/price-repository";
import { Currency } from "../domain/value-objects/currency";
import { Money } from "../domain/value-objects/money";
import { ProductRef } from "../domain/value-objects/product-ref";

export interface CreatePriceInput {
  readonly priceListId: string;
  readonly productId: string;
  readonly amountMinor: number;
  readonly currency: string;
}

export interface CreatePriceOutput {
  readonly id: string;
}

export interface CreatePriceDeps {
  readonly prices: PriceRepository;
  readonly unitOfWork: TransactionalUnitOfWork<unknown>;
  readonly idGenerator: IdGenerator;
}

/** Creates a price for a product within a price list (the price list is referenced by id). */
export class CreatePrice implements UseCase<CreatePriceInput, CreatePriceOutput, DomainError> {
  private readonly deps: CreatePriceDeps;

  constructor(deps: CreatePriceDeps) {
    this.deps = deps;
  }

  async execute(input: CreatePriceInput): Promise<Result<CreatePriceOutput, DomainError>> {
    const product = ProductRef.create(input.productId);
    if (!product.ok) return err(product.error);
    const currency = Currency.create(input.currency);
    if (!currency.ok) return err(currency.error);
    const amount = Money.create(input.amountMinor, currency.value);
    if (!amount.ok) return err(amount.error);

    return this.deps.unitOfWork.run<Result<CreatePriceOutput, DomainError>>(async () => {
      const id = UniqueEntityId.from(this.deps.idGenerator.generate());
      const price = Price.create(id, input.priceListId, product.value, amount.value);
      await this.deps.prices.save(price);
      return ok({ id: id.toString() });
    });
  }
}
