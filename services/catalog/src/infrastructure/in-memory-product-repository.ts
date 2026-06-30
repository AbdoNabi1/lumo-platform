import type { EventContext, OutboxWriter } from "@platform/messaging";
import type { Product } from "../domain/product";
import type { ProductRepository } from "../domain/product-repository";

export interface InMemoryProductRepositoryDeps {
  readonly outbox: OutboxWriter;
  readonly context: EventContext;
}

/**
 * In-memory `ProductRepository`. On save it persists the aggregate and writes its pulled domain
 * events to the outbox (the standard pattern; a Prisma adapter does this inside the DB transaction).
 */
export class InMemoryProductRepository implements ProductRepository {
  private readonly store = new Map<string, Product>();
  private readonly outbox: OutboxWriter;
  private readonly context: EventContext;

  constructor(deps: InMemoryProductRepositoryDeps) {
    this.outbox = deps.outbox;
    this.context = deps.context;
  }

  async save(product: Product): Promise<void> {
    this.store.set(product.id.toString(), product);
    await this.outbox.write(product.pullDomainEvents(), this.context, undefined);
  }

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }
}
