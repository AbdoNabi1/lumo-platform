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
import { CreateCategory } from "./application/create-category.use-case";
import { CreateProduct } from "./application/create-product.use-case";
import { PublishProduct } from "./application/publish-product.use-case";
import { UpdateProduct } from "./application/update-product.use-case";
import { CatalogEventTranslator } from "./infrastructure/catalog-event-translator";
import { InMemoryCategoryRepository } from "./infrastructure/in-memory-category-repository";
import { InMemoryProductRepository } from "./infrastructure/in-memory-product-repository";
import { InMemoryUnitOfWork } from "./infrastructure/in-memory-unit-of-work";
import { CategoryController } from "./interfaces/category.controller";
import { ProductController } from "./interfaces/product.controller";

export interface CatalogWiringDeps {
  readonly serializer: EventSerializer;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
}

export interface WiredCatalog {
  readonly products: ProductController;
  readonly categories: CategoryController;
  /** Drains the outbox once (relay → publisher → subscribers); returns the number published. */
  readonly drainOutbox: () => Promise<number>;
  /** Integration-event types delivered so far (for demonstration/tests). */
  readonly deliveredEventTypes: readonly string[];
}

/**
 * Composition root for the Catalog context — wires domain → application → in-memory repositories +
 * unit of work → outbox → in-memory relay/publisher. Proves the slice in-process; Prisma + a real
 * broker replace the in-memory adapters when wired. Serializer/id/clock are injected.
 */
export function wireCatalog(deps: CatalogWiringDeps): WiredCatalog {
  const outboxStore = new InMemoryOutboxStore();
  const outboxWriter = new OutboxWriter({
    store: outboxStore,
    translator: new CatalogEventTranslator(),
    serializer: deps.serializer,
    clock: deps.clock,
  });
  const context = rootEventContext(deps.idGenerator);

  const products = new InMemoryProductRepository({ outbox: outboxWriter, context });
  const categories = new InMemoryCategoryRepository({ outbox: outboxWriter, context });
  const unitOfWork = new InMemoryUnitOfWork();

  const productController = new ProductController({
    createProduct: new CreateProduct({
      products,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
    publishProduct: new PublishProduct({
      products,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
    updateProduct: new UpdateProduct({
      products,
      unitOfWork,
      idGenerator: deps.idGenerator,
      clock: deps.clock,
    }),
  });
  const categoryController = new CategoryController(
    new CreateCategory({ categories, unitOfWork, idGenerator: deps.idGenerator }),
  );

  const bus = new InMemoryEventBus();
  const delivered: string[] = [];
  const sink: Subscriber = async (record) => {
    delivered.push(record.headers.type ?? record.topic);
  };
  bus.subscribe("catalog.product.published.v1", sink);
  bus.subscribe("catalog.product.updated.v1", sink);

  const relay = new OutboxRelay({
    store: outboxStore,
    publisher: new InMemoryEventPublisher(bus),
    clock: deps.clock,
  });

  return {
    products: productController,
    categories: categoryController,
    drainOutbox: () => relay.drainOnce(),
    deliveredEventTypes: delivered,
  };
}
