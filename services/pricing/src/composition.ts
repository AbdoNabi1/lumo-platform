import type { Clock, IdGenerator } from "@platform/contracts";
import type { EventSerializer } from "@platform/domain-events";
import {
  InMemoryEventBus,
  InMemoryEventPublisher,
  InMemoryOutboxStore,
  OutboxRelay,
  OutboxWriter,
  rootEventContext,
  type Subscriber,
} from "@platform/messaging";
import { ActivatePriceList } from "./application/activate-price-list.use-case";
import { ChangePrice } from "./application/change-price.use-case";
import { CreatePrice } from "./application/create-price.use-case";
import { CreatePriceList } from "./application/create-price-list.use-case";
import { InMemoryPriceListRepository } from "./infrastructure/in-memory-price-list-repository";
import { InMemoryPriceRepository } from "./infrastructure/in-memory-price-repository";
import { InMemoryUnitOfWork } from "./infrastructure/in-memory-unit-of-work";
import { PricingEventTranslator } from "./infrastructure/pricing-event-translator";
import { PriceListController } from "./interfaces/price-list.controller";
import { PriceController } from "./interfaces/price.controller";

export interface PricingWiringDeps {
  readonly serializer: EventSerializer;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
}

export interface WiredPricing {
  readonly prices: PriceController;
  readonly priceLists: PriceListController;
  readonly drainOutbox: () => Promise<number>;
  readonly deliveredEventTypes: readonly string[];
}

/** Composition root for the Pricing context — wires the slice with in-memory adapters. */
export function wirePricing(deps: PricingWiringDeps): WiredPricing {
  const outboxStore = new InMemoryOutboxStore();
  const outboxWriter = new OutboxWriter({
    store: outboxStore,
    translator: new PricingEventTranslator(),
    serializer: deps.serializer,
    clock: deps.clock,
  });
  const context = rootEventContext(deps.idGenerator);

  const prices = new InMemoryPriceRepository({ outbox: outboxWriter, context });
  const priceLists = new InMemoryPriceListRepository({ outbox: outboxWriter, context });
  const unitOfWork = new InMemoryUnitOfWork();

  const priceController = new PriceController({
    createPrice: new CreatePrice({ prices, unitOfWork, idGenerator: deps.idGenerator }),
    changePrice: new ChangePrice({
      prices,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
  });
  const priceListController = new PriceListController({
    createPriceList: new CreatePriceList({ priceLists, unitOfWork, idGenerator: deps.idGenerator }),
    activatePriceList: new ActivatePriceList({ priceLists, unitOfWork }),
  });

  const bus = new InMemoryEventBus();
  const delivered: string[] = [];
  const sink: Subscriber = async (record) => {
    delivered.push(record.headers.type ?? record.topic);
  };
  bus.subscribe("pricing.price.changed.v1", sink);

  const relay = new OutboxRelay({
    store: outboxStore,
    publisher: new InMemoryEventPublisher(bus),
    clock: deps.clock,
  });

  return {
    prices: priceController,
    priceLists: priceListController,
    drainOutbox: () => relay.drainOnce(),
    deliveredEventTypes: delivered,
  };
}
