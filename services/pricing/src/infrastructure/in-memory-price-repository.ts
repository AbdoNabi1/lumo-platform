import type { EventContext, OutboxWriter } from "@platform/messaging";
import type { Price } from "../domain/price";
import type { PriceRepository } from "../domain/price-repository";

export interface InMemoryPriceRepositoryDeps {
  readonly outbox: OutboxWriter;
  readonly context: EventContext;
}

/** In-memory `PriceRepository`. Persists the aggregate and writes its events to the outbox on save. */
export class InMemoryPriceRepository implements PriceRepository {
  private readonly store = new Map<string, Price>();
  private readonly outbox: OutboxWriter;
  private readonly context: EventContext;

  constructor(deps: InMemoryPriceRepositoryDeps) {
    this.outbox = deps.outbox;
    this.context = deps.context;
  }

  async save(price: Price): Promise<void> {
    this.store.set(price.id.toString(), price);
    await this.outbox.write(price.pullDomainEvents(), this.context, undefined);
  }

  async findById(id: string): Promise<Price | null> {
    return this.store.get(id) ?? null;
  }
}
