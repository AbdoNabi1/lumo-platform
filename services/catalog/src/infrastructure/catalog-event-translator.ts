import type { DomainEvent } from "@platform/domain";
import type { IntegrationEventDescriptor, IntegrationEventTranslator } from "@platform/messaging";
import { ProductPublished } from "../domain/events/product-published.event";
import { ProductUpdated } from "../domain/events/product-updated.event";

/** Maps Catalog domain events to integration events (keeps the domain pure). */
export class CatalogEventTranslator implements IntegrationEventTranslator {
  translate(event: DomainEvent): IntegrationEventDescriptor | undefined {
    if (event instanceof ProductPublished) {
      return {
        type: "catalog.product.published",
        eventVersion: 1,
        aggregateType: "product",
        payload: event.data,
      };
    }
    if (event instanceof ProductUpdated) {
      return {
        type: "catalog.product.updated",
        eventVersion: 1,
        aggregateType: "product",
        payload: event.data,
      };
    }
    return undefined;
  }
}
