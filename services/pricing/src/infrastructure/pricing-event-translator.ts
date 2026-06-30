import type { DomainEvent } from "@platform/domain";
import type { IntegrationEventDescriptor, IntegrationEventTranslator } from "@platform/messaging";
import { PriceChanged } from "../domain/events/price-changed.event";

/** Maps Pricing domain events to integration events. */
export class PricingEventTranslator implements IntegrationEventTranslator {
  translate(event: DomainEvent): IntegrationEventDescriptor | undefined {
    if (event instanceof PriceChanged) {
      return {
        type: "pricing.price.changed",
        eventVersion: 1,
        aggregateType: "price",
        payload: event.data,
      };
    }
    return undefined;
  }
}
