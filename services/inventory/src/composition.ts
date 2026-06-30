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
import { AdjustInventory } from "./application/adjust-inventory.use-case";
import { ReceiveStock } from "./application/receive-stock.use-case";
import { ReleaseReservation } from "./application/release-reservation.use-case";
import { ReserveStock } from "./application/reserve-stock.use-case";
import { InMemoryInventoryItemRepository } from "./infrastructure/in-memory-inventory-item-repository";
import { InMemoryUnitOfWork } from "./infrastructure/in-memory-unit-of-work";
import { InventoryEventTranslator } from "./infrastructure/inventory-event-translator";
import { InventoryController } from "./interfaces/inventory.controller";

export interface InventoryWiringDeps {
  readonly serializer: EventSerializer;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
}

export interface WiredInventory {
  readonly inventory: InventoryController;
  readonly drainOutbox: () => Promise<number>;
  readonly deliveredEventTypes: readonly string[];
}

/** Composition root for the Inventory context — wires the slice with in-memory adapters. */
export function wireInventory(deps: InventoryWiringDeps): WiredInventory {
  const outboxStore = new InMemoryOutboxStore();
  const outboxWriter = new OutboxWriter({
    store: outboxStore,
    translator: new InventoryEventTranslator(),
    serializer: deps.serializer,
    clock: deps.clock,
  });
  const context = rootEventContext(deps.idGenerator);

  const items = new InMemoryInventoryItemRepository({ outbox: outboxWriter, context });
  const unitOfWork = new InMemoryUnitOfWork();

  const controller = new InventoryController({
    receiveStock: new ReceiveStock({
      items,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
    reserveStock: new ReserveStock({
      items,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
    releaseReservation: new ReleaseReservation({
      items,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
    adjustInventory: new AdjustInventory({
      items,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
  });

  const bus = new InMemoryEventBus();
  const delivered: string[] = [];
  const sink: Subscriber = async (record) => {
    delivered.push(record.headers.type ?? record.topic);
  };
  bus.subscribe("inventory.inventory_item.adjusted.v1", sink);

  const relay = new OutboxRelay({
    store: outboxStore,
    publisher: new InMemoryEventPublisher(bus),
    clock: deps.clock,
  });

  return {
    inventory: controller,
    drainOutbox: () => relay.drainOnce(),
    deliveredEventTypes: delivered,
  };
}
