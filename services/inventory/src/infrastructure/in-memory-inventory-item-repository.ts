import type { EventContext, OutboxWriter } from "@platform/messaging";
import type { InventoryItem } from "../domain/inventory-item";
import type { InventoryItemRepository } from "../domain/inventory-item-repository";

export interface InMemoryInventoryItemRepositoryDeps {
  readonly outbox: OutboxWriter;
  readonly context: EventContext;
}

/**
 * In-memory `InventoryItemRepository`. Persists the aggregate and writes its events to the outbox
 * on save. The natural-key lookup scans the store (acceptable for the in-memory adapter).
 */
export class InMemoryInventoryItemRepository implements InventoryItemRepository {
  private readonly store = new Map<string, InventoryItem>();
  private readonly outbox: OutboxWriter;
  private readonly context: EventContext;

  constructor(deps: InMemoryInventoryItemRepositoryDeps) {
    this.outbox = deps.outbox;
    this.context = deps.context;
  }

  async save(item: InventoryItem): Promise<void> {
    this.store.set(item.id.toString(), item);
    await this.outbox.write(item.pullDomainEvents(), this.context, undefined);
  }

  async findById(id: string): Promise<InventoryItem | null> {
    return this.store.get(id) ?? null;
  }

  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<InventoryItem | null> {
    for (const item of this.store.values()) {
      if (item.product.value === productId && item.warehouseId.value === warehouseId) {
        return item;
      }
    }
    return null;
  }
}
