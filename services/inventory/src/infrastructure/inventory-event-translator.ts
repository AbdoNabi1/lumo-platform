import type { DomainEvent } from "@platform/domain";
import type { IntegrationEventDescriptor, IntegrationEventTranslator } from "@platform/messaging";
import { InventoryAdjusted } from "../domain/events/inventory-adjusted.event";

/** Maps Inventory domain events to integration events. */
export class InventoryEventTranslator implements IntegrationEventTranslator {
  translate(event: DomainEvent): IntegrationEventDescriptor | undefined {
    if (event instanceof InventoryAdjusted) {
      return {
        type: "inventory.inventory_item.adjusted",
        eventVersion: 1,
        aggregateType: "inventory_item",
        payload: event.data,
      };
    }
    return undefined;
  }
}
