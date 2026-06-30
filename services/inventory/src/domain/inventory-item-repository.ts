import type { InventoryItem } from "./inventory-item";

/** Persistence port for {@link InventoryItem}. Implemented in infrastructure. */
export interface InventoryItemRepository {
  save(item: InventoryItem): Promise<void>;
  findById(id: string): Promise<InventoryItem | null>;
  /** Looks up the item for a product at a warehouse (the natural key). */
  findByProductAndWarehouse(productId: string, warehouseId: string): Promise<InventoryItem | null>;
}
