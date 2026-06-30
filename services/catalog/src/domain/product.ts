import { AggregateRoot, BusinessRuleError, type UniqueEntityId } from "@platform/domain";
import { ProductPublished } from "./events/product-published.event";
import { ProductUpdated } from "./events/product-updated.event";
import type { MediaRef } from "./value-objects/media-ref";
import { PublishState } from "./value-objects/publish-state";
import type { Sku } from "./value-objects/sku";
import type { Slug } from "./value-objects/slug";
import type { Variant } from "./variant";

interface ProductProps {
  readonly sku: Sku;
  name: string;
  slug: Slug;
  status: PublishState;
  readonly variants: readonly Variant[];
  readonly media: readonly MediaRef[];
}

export interface NewProduct {
  readonly sku: Sku;
  readonly name: string;
  readonly slug: Slug;
  readonly variants: readonly Variant[];
  readonly media?: readonly MediaRef[];
}

/** Catalog product aggregate. Created as a draft; emits events on publish/update. */
export class Product extends AggregateRoot<ProductProps> {
  static create(id: UniqueEntityId, props: NewProduct): Product {
    if (props.variants.length === 0) {
      throw new BusinessRuleError("A product must have at least one variant");
    }
    return new Product(
      {
        sku: props.sku,
        name: props.name,
        slug: props.slug,
        status: PublishState.draft(),
        variants: props.variants,
        media: props.media ?? [],
      },
      id,
    );
  }

  publish(eventId: string, occurredAt: Date): void {
    if (this.props.status.isPublished) {
      throw new BusinessRuleError("Product is already published");
    }
    this.props.status = PublishState.published();
    this.addDomainEvent(
      new ProductPublished(
        { eventId, aggregateId: this.id, occurredAt },
        { sku: this.props.sku.value, name: this.props.name, slug: this.props.slug.value },
      ),
    );
  }

  update(name: string, slug: Slug, eventId: string, occurredAt: Date): void {
    this.props.name = name;
    this.props.slug = slug;
    this.addDomainEvent(
      new ProductUpdated({ eventId, aggregateId: this.id, occurredAt }, { name, slug: slug.value }),
    );
  }

  get sku(): Sku {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get status(): PublishState {
    return this.props.status;
  }

  get variants(): readonly Variant[] {
    return this.props.variants;
  }

  get media(): readonly MediaRef[] {
    return this.props.media;
  }
}
