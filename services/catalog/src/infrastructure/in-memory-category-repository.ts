import type { EventContext, OutboxWriter } from "@platform/messaging";
import type { Category } from "../domain/category";
import type { CategoryRepository } from "../domain/category-repository";

export interface InMemoryCategoryRepositoryDeps {
  readonly outbox: OutboxWriter;
  readonly context: EventContext;
}

/**
 * In-memory `CategoryRepository`. Uses the same outbox-on-save pattern as products for uniformity;
 * categories currently raise no events, so the outbox write is a no-op until they do.
 */
export class InMemoryCategoryRepository implements CategoryRepository {
  private readonly store = new Map<string, Category>();
  private readonly outbox: OutboxWriter;
  private readonly context: EventContext;

  constructor(deps: InMemoryCategoryRepositoryDeps) {
    this.outbox = deps.outbox;
    this.context = deps.context;
  }

  async save(category: Category): Promise<void> {
    this.store.set(category.id.toString(), category);
    await this.outbox.write(category.pullDomainEvents(), this.context, undefined);
  }

  async findById(id: string): Promise<Category | null> {
    return this.store.get(id) ?? null;
  }
}
